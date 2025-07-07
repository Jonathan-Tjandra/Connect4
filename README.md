# Four in a Line - Real-time Web Game

This is a full-stack web application that allows two players to play the classic "Four in a Line" (or Connect Four) game in real-time in their browsers. Players can create a private game room and share a unique code with a friend to join and play.

## Features

* **Real-time Gameplay**: Uses WebSockets for instant communication between players.
* **Private Game Rooms**: Create a new game to generate a unique 8-character code to share.
* **Turn-Based Logic**: The application enforces player turns.
* **Win/Draw Detection**: Automatically detects and announces when a player wins or the game is a draw.
* **Session Score Tracking**: Keeps a running tally of wins, losses, and draws for the current session.
* **Interactive Rematch System**: After a game ends, players can request, accept, or decline a rematch.
* **Abandon Game**: Players can leave a game mid-progress.
* **UI/UX Polish**: Features animated piece drops and a clean, responsive layout.

## Tech Stack

* **Frontend**: React.js, Socket.IO Client, CSS
* **Backend**: Flask (Python), Flask-SocketIO

## Setup and Installation

To run this project locally, you will need to run both the backend server and the frontend client.

### Prerequisites

* Python 3.x
* Node.js and npm

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd four-in-a-line
```

### 2. Backend Setup

Open a terminal window and navigate to the `backend` directory.

```bash
# Navigate to the backend folder
cd backend

# Create and activate a virtual environment
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt

# Run the backend server
python app.py
```
The backend server will now be running on `http://localhost:5001`.

### 3. Frontend Setup

Open a **new, separate terminal window** and navigate to the `frontend` directory.

```bash
# Navigate to the frontend folder
cd frontend

# Install the required dependencies
npm install

# Run the frontend client
npm start
```
The React application will open in your browser at `http://localhost:3000`.

## How to Play

1.  Open two browser windows/tabs and navigate to `http://localhost:3000`.
2.  **Player 1**: Click the **"Start New Game"** button.
3.  **Player 1**: Copy the 8-character **Room Code** that appears in the "Game Info" panel.
4.  **Player 2**: Paste the Room Code into the input box and click **"Join Game"**.
5.  The game will start. Take turns clicking on the indicators at the top of the columns to drop your piece.
6.  The first player to get four of their pieces in a line (horizontally, vertically, or diagonally) wins!