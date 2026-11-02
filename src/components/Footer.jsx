import React from "react";
import styled from "styled-components";

// Placeholder for the Spectator footer.
const FooterBar = styled.footer`
  width: 100%;
  height: 200px;
  background: #000000;

  /* Pins to the bottom on short pages; Page is a flex column. */
  margin-top: auto;
`;

const Footer = () => <FooterBar />;

export default Footer;
