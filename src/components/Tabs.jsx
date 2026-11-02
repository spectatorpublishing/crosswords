import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const TabRow = styled.nav`
  display: flex;
  justify-content: center;
  margin: 0 auto 26px;
`;

const Tab = styled(Link)`
  flex: 0 0 auto;
  min-width: 190px;
  padding: 13px 18px;

  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 17px;
  text-align: center;
  text-decoration: none;
  color: #000000;

  background: ${(props) => (props.$active ? "#ffffff" : "#d9d9d9")};
  border: 1px solid #c4c4c4;

  /* The pair reads as one control: only the outer corners round off, and the
     shared edge collapses to a single line. */
  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  &:last-child {
    border-radius: 0 8px 8px 0;
    border-left: none;
  }

  @media (max-width: 480px) {
    min-width: 0;
    flex: 1 1 0;
  }
`;

const Tabs = ({ mode }) => (
  <TabRow>
    <Tab
      to="/minis"
      $active={mode === "mini"}
      aria-current={mode === "mini" ? "page" : undefined}
    >
      Minis
    </Tab>
    <Tab
      to="/crosswords"
      $active={mode === "full"}
      aria-current={mode === "full" ? "page" : undefined}
    >
      Crosswords
    </Tab>
  </TabRow>
);

export default Tabs;
