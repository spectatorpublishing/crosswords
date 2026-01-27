import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function PuzzleList() {
  const puzzles = [
    { id: "RNwE74wUBUW0a8bezMCE2nn7Snf2", title: "Puzzle #1" },
    { id: "abc123", title: "Puzzle #2" },
    // add more puzzle IDs
  ];

  return (
    <div className="puzzle-list">
      <h1>Crossword Puzzles</h1>

      <p className="puzzle-intro">
        Welcome! Select a crossword below to open it full screen.
      </p>

      <ul>
        {puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <Link to={`/puzzle/${puzzle.id}`}>
              {puzzle.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
