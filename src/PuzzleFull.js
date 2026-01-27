import React from "react";
import { useParams } from "react-router-dom";

export default function PuzzleFull() {
  const { puzzleId } = useParams();

  return (
    <iframe
      title="Full Screen Puzzle"
      src={`https://crosshare.org/embed/list/${puzzleId}`}
      allow="clipboard-write *"
      allowFullScreen
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}
