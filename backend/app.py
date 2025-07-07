import random
import string
from flask import Flask, request
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

games = {}

# --- Helper Functions (No changes needed here) ---
def generate_room_code():
    while True:
        code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        if code not in games:
            return code

def check_winner(board):
    ROWS, COLS = 6, 7
    for r in range(ROWS):
        for c in range(COLS - 3):
            if board[c][r] and board[c][r] == board[c+1][r] == board[c+2][r] == board[c+3][r]: return board[c][r]
    for c in range(COLS):
        for r in range(ROWS - 3):
            if board[c][r] and board[c][r] == board[c][r+1] == board[c][r+2] == board[c][r+3]: return board[c][r]
    for c in range(COLS - 3):
        for r in range(ROWS - 3):
            if board[c][r] and board[c][r] == board[c+1][r+1] == board[c+2][r+2] == board[c+3][r+3]: return board[c][r]
    for c in range(COLS - 3):
        for r in range(3, ROWS):
            if board[c][r] and board[c][r] == board[c+1][r-1] == board[c+2][r-2] == board[c+3][r-3]: return board[c][r]
    return None

def check_draw(board):
    return all(cell is not None for col in board for cell in col)

def reset_game(game):
    last_turn_player_id = game.get('turn')
    try:
        next_turn_player_id = next(p for p in game['players'] if p != last_turn_player_id)
    except (StopIteration, TypeError):
        next_turn_player_id = game['players'][0]
    game['board'] = [[None for _ in range(6)] for _ in range(7)]
    game['status'] = 'in_progress'
    game['turn'] = next_turn_player_id
    game['winner'] = None
    game['play_again_requests'] = []
    return game

# --- Socket Event Handlers ---

@socketio.on('connect')
def handle_connect():
    print(f"✅ Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"❌ Client disconnected: {request.sid}")

@socketio.on('create_game')
def handle_create_game():
    player_id = request.sid
    room_code = generate_room_code()
    games[room_code] = {
        "players": [player_id], "board": [[None for _ in range(6)] for _ in range(7)],
        "turn": player_id, "status": "waiting", "room_code": room_code,
        "play_again_requests": [], "scores": {}
    }
    join_room(room_code)
    emit('game_created', games[room_code])

@socketio.on('join_game')
def handle_join_game(data):
    player_id = request.sid
    room_code = data.get('room_code')
    if room_code in games and len(games[room_code]['players']) == 1:
        game = games[room_code]
        game['players'].append(player_id)
        game['status'] = 'in_progress'
        creator_id = game['players'][0]
        game['scores'] = {creator_id: 0, player_id: 0, "draws": 0}
        
        # This is the key sequence: the new player joins the room,
        # and then the event is broadcast to everyone in that room.
        join_room(room_code)
        emit('game_started', game, to=room_code)
    else:
        emit('error', {'message': 'Invalid or full game room.'})

# --- (The rest of your app.py file remains the same) ---
@socketio.on('make_move')
def handle_make_move(data):
    room_code, col_index, player_id = data.get('room_code'), data.get('col'), request.sid
    game = games.get(room_code)
    if not game or game['turn'] != player_id: return
    target_row = next((i for i, cell in enumerate(game['board'][col_index]) if cell is None), -1)
    if target_row == -1: return
    player_index = game['players'].index(player_id)
    color = 'red' if player_index == 0 else 'yellow'
    game['board'][col_index][target_row] = color
    winner_color = check_winner(game['board'])
    if winner_color:
        winner_id = game['players'][player_index]
        game.update({'status': 'won', 'winner': winner_id})
        game['scores'][winner_id] += 1
        emit('game_over', game, to=room_code)
    elif check_draw(game['board']):
        game.update({'status': 'draw', 'winner': None})
        game['scores']['draws'] += 1
        emit('game_over', game, to=room_code)
    else:
        game['turn'] = game['players'][1 - player_index]
        emit('game_updated', game, to=room_code)

@socketio.on('abandon_game')
def handle_abandon_game(data):
    player_id, room_code = request.sid, data.get('room_code')
    game = games.get(room_code)
    if not game or player_id not in game['players']: return
    if len(game['players']) > 1:
        opponent_id = next(p for p in game['players'] if p != player_id)
        if opponent_id in game['scores']: game['scores'][opponent_id] += 1
        emit('opponent_abandoned', {}, room=opponent_id)
    if room_code in games:
        del games[room_code]

@socketio.on('request_rematch')
def handle_request_rematch(data):
    player_id, room_code = request.sid, data.get('room_code')
    game = games.get(room_code)
    if not game or player_id in game['play_again_requests']: return
    game['play_again_requests'].append(player_id)
    opponent_id = next(p for p in game['players'] if p != player_id)
    emit('rematch_requested', {'requester': player_id}, room=opponent_id)
    emit('waiting_for_opponent', room=player_id)

@socketio.on('cancel_rematch')
def handle_cancel_rematch(data):
    room_code, game = data.get('room_code'), games.get(data.get('room_code'))
    if game:
        game['play_again_requests'] = []
        emit('rematch_canceled', {}, to=room_code)

@socketio.on('accept_rematch')
def handle_accept_rematch(data):
    room_code, game = data.get('room_code'), games.get(data.get('room_code'))
    if game and len(game.get('play_again_requests', [])) == 1:
        new_game_state = reset_game(game)
        emit('game_started', new_game_state, to=room_code)
    
@socketio.on('decline_rematch')
def handle_decline_rematch(data):
    room_code = data.get('room_code')
    game = games.get(room_code)
    if not game: return
    
    # Find who the original requester was before clearing the list
    requester_id = game['play_again_requests'][0] if game.get('play_again_requests') else None
    
    game['play_again_requests'] = [] # Clear all requests
    # Emit to the whole room, but include the requester's ID in the payload
    emit('rematch_declined', {'requester_id': requester_id}, to=room_code)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001)