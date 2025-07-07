import React from 'react';
import Cell from './Cell';
import './Column.css';

const Column = ({ columnData }) => {
  return (
    <div className="column">
      {columnData.map((cellValue, index) => (
        <Cell key={index} value={cellValue} rowIndex={index} />
      ))}
    </div>
  );
};

export default Column;