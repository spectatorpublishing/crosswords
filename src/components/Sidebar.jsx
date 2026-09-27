import React from "react";
import styled from "styled-components";
import { VerticalBox } from "./AdSlot";

const SUBMIT_OPED_URL = "mailto:opinion@columbiaspectator.com";
const SEND_TIP_URL = "mailto:tips@columbiaspectator.com";

const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
`;

const LinkBlock = styled.div`
  width: 100%;
  max-width: 300px;
`;

const BlockTitle = styled.div`
  font-family: "Merriweather", "Bitter", Georgia, serif;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
`;

const BlockLink = styled.a`
  display: block;
  padding-bottom: 5px;

  font-family:
    "Open Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 13px;
  color: #000000;
  text-decoration: none;

  border-bottom: 1px solid #000000;

  &:hover {
    text-decoration: underline;
  }
`;

const Sidebar = ({ withLinks = false }) => (
  <Rail>
    <VerticalBox />

    {withLinks && (
      <>
        <LinkBlock>
          <BlockTitle>Write with us:</BlockTitle>
          <BlockLink href={SUBMIT_OPED_URL}>Submit an op-ed ></BlockLink>
        </LinkBlock>

        <LinkBlock>
          <BlockTitle>Have a tip?</BlockTitle>
          <BlockLink href={SEND_TIP_URL}>Send it to us here ></BlockLink>
        </LinkBlock>
      </>
    )}

    <VerticalBox />
  </Rail>
);

export default Sidebar;
