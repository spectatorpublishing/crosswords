import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import GridIcon from "./GridIcon";

const TINTS = {
  teal: "#9bcfc6",
  lightBlue: "#d3e3f8",
  yellow: "#fae79b",
  purple: "#c3b4f2",
  lime: "#d8ee95",
};

const Card = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 230px;

  background: #ffffff;
  border: 1.5px solid #a9ccee;
  border-radius: 12px;
  overflow: hidden;
`;

const Tint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;

  padding: 26px 16px 18px;
  background: ${(props) => props.$tint};
`;

const Label = styled.div`
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-weight: 700;
  font-size: 19px;
  color: #000000;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
`;

const Action = styled(Link)`
  display: block;
  padding: 8px 12px;

  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 13px;
  text-align: center;
  text-decoration: none;
  color: #000000;

  background: #ffffff;
  border: 1px solid #a9ccee;
  border-radius: 999px;

  transition: background 140ms ease;

  &:hover {
    background: #f1f6fd;
  }
`;

// Play has no destination until the newest puzzle loads.
const PendingAction = styled(Action).attrs({ as: "span" })`
  opacity: 0.5;
  cursor: default;

  &:hover {
    background: #ffffff;
  }
`;

const GameCard = ({ label, tint = "lightBlue", playTo, pastTo, pastLabel }) => (
  <Card>
    <Tint $tint={TINTS[tint] || TINTS.lightBlue}>
      <GridIcon size={56} />
      <Label>{label}</Label>
    </Tint>

    <Actions>
      {playTo ? (
        <Action to={playTo}>Play</Action>
      ) : (
        <PendingAction>Play</PendingAction>
      )}

      <Action to={pastTo}>{pastLabel}</Action>
    </Actions>
  </Card>
);

export default GameCard;
