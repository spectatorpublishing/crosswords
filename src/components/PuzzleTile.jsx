import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import GridIcon from "./GridIcon";
import PadlockIcon from "./PadlockIcon";

const VARIANTS = {
  default: { background: "#ffffff", text: "#000000", cell: "#60a0e5" },
  lightBlue: { background: "#d3e3f8", text: "#000000", cell: "#60a0e5" },
  selected: { background: "#60a0e5", text: "#ffffff", cell: "#000000" },
  teal: { background: "#9bcfc6", text: "#000000", cell: "#60a0e5" },
  purple: { background: "#c3b4f2", text: "#000000", cell: "#60a0e5" },
  yellow: { background: "#fae79b", text: "#000000", cell: "#60a0e5" },
  lime: { background: "#d8ee95", text: "#000000", cell: "#60a0e5" },
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  box-sizing: border-box;
  width: 100%;
  min-height: 215px;
  padding: 18px 16px 14px;

  background: ${(props) => props.$variant.background};
  border: 1.5px solid #a9ccee;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  text-align: center;
  text-decoration: none;
  color: ${(props) => props.$variant.text};

  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const Title = styled.div`
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-weight: 700;
  font-size: 19px;
  line-height: 1.25;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PubDate = styled.div`
  margin-top: 4px;
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-size: 14px;
`;

// Holds the grid mark, and the padlock tucked behind it on locked tiles.
const Mark = styled.div`
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
  width: 100%;
  margin: 10px 0;
`;

const Padlock = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-30%, -68%);
  line-height: 0;
  z-index: 0;
`;

// Positioned so it paints over the padlock rather than under it — the grid's
// black border crosses the lock body in the design.
const MarkIcon = styled.span`
  position: relative;
  z-index: 1;
  line-height: 0;
`;

const Byline = styled.div`
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-size: 11px;
`;

// Mini titles arrive as "Daily Mini: 09/20/2026", but the tile prints the date
// on its own line — so drop the trailing date to avoid showing it twice.
function stripTrailingDate(title) {
  if (!title) return "Untitled Crossword";
  return title.replace(/:\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/, "").trim();
}

function formatDate(pubDate) {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// `siblings` is the list this tile was rendered from. Both it and the puzzle
// ride along in router state, so a click hands the detail page everything it
// needs and it can skip the archive lookup entirely.
const PuzzleTile = ({
  puzzle,
  siblings,
  variant = "default",
  locked = false,
}) => {
  const style = VARIANTS[variant] || VARIANTS.default;
  const { id, title, pubDate, author } = puzzle || {};

  return (
    <Card
      as={id ? Link : "div"}
      to={id ? `/puzzle/${id}` : undefined}
      state={id ? { puzzle, all: siblings } : undefined}
      $variant={style}
    >
      <Title>{stripTrailingDate(title)}</Title>
      <PubDate>{formatDate(pubDate)}</PubDate>

      <Mark>
        {locked && (
          <Padlock>
            <PadlockIcon />
          </Padlock>
        )}
        <MarkIcon>
          <GridIcon cell={style.cell} />
        </MarkIcon>
      </Mark>

      {author && <Byline>by {author}</Byline>}
    </Card>
  );
};

export default PuzzleTile;
