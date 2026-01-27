import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function PuzzleIndex() {
  const puzzles = [
    {
      id: "RNwE74wUBUW0a8bezMCE2nn7Snf2",
      title: "testing 2 (unfinished)",
      published: "Published about 1 hour ago",
    },
    {
      id: "abc123",
      title: "testing",
      published: "Published about 2 hours ago",
    },
  ];

  return (
    <div className="index-page">
      <h1>Crosswords</h1>

      <p className="index-intro">
        Choose a crossword below to play.
      </p>

      <ul className="puzzle-list">
        {puzzles.map((puzzle) => (
          <li key={puzzle.id} className="puzzle-item">
            <Link to={`/puzzle/${puzzle.id}`} className="puzzle-link">
              {puzzle.title}
            </Link>
            <div className="puzzle-meta">{puzzle.published}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
