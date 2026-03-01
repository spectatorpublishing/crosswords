import React from "react";
import styled from "styled-components";
import SpecCrosswords from "./images/SpecCrosswords.png";

const CrossWordImage = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
`;

const Logo = styled.img`
  max-width: 80%;
  max-height: 60%;
  height: auto;
  display: block;
  user-select: none;
  pointer-events: none;
`;

const Card = styled.div`
  width: 220px;
  height: 220px;
  padding: 16px;
  box-sizing: border-box;

  position: relative;
  overflow: hidden;

  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  text-decoration: none;
  color: inherit;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;

  &:hover {
    transform: translateY(-3px);
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  position: relative;
  z-index: 1;

  font-size: 20px;
  font-weight: 700;
  font-family: "Bitter", serif;
  color: #1d4ed8;
  letter-spacing: 0.5px;

  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

/*
const Title = styled.div`
  position: relative;
  z-index: 1;

  font-size: 16px;
  font-weight: 700;
  font-family: "Bitter", serif;
  color: #0f172a;
  line-height: 1.25;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
*/

const Footer = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PubDate = styled.div`
  font-size: 11px;
  font-family: "Bitter", serif;
  color: #64748b;
`;

const Open = styled.div`
  font-size: 12px;
  font-weight: 800;
  font-family: "Bitter", serif;
  color: #1d4ed8;

  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.16);

  transition:
    background 180ms ease,
    transform 180ms ease,
    border-color 180ms ease;

  ${Card}:hover & {
    background: rgba(37, 99, 235, 0.12);
    border-color: rgba(37, 99, 235, 0.26);
    transform: translateY(-1px);
  }
`;

const list_id = "VrpqDMgLzHOLOGWBtAmbA5zdV0s2";

function transformLink(link) {
  if (!link) return null;
  const match = link.match(/crosswords\/([^/]+)/);
  if (!match) return null;
  const puzzleId = match[1];
  return `https://crosshare.org/embed/${puzzleId}/${list_id}`;
}

const CrosswordBox = ({ title, link, pubDate }) => {
  return (
    <Card
      as={transformLink(link) ? "a" : "div"}
      href={transformLink(link) || undefined}
      target={transformLink(link) ? "_blank" : undefined}
      rel={transformLink(link) ? "noreferrer" : undefined}
    >
      <Header>{title || "Untitled Crossword"}</Header>

      <CrossWordImage>
        <Logo src={SpecCrosswords} alt="Spec Crosswords" />
      </CrossWordImage>

      <Footer>
        <PubDate>{pubDate ? new Date(pubDate).toDateString() : ""}</PubDate>
        <Open>Play Now</Open>
      </Footer>
    </Card>
  );
};

export default CrosswordBox;
