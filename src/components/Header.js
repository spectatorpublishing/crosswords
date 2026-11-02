import React from "react";
import styled from "styled-components";
import SpecNavbar, { NAVBAR_HEIGHT } from "./SpecNavbar";

const Spacer = styled.div`
  height: ${NAVBAR_HEIGHT};
  margin-bottom: 28px;
`;

const Header = () => (
  <>
    <SpecNavbar />
    <Spacer />
  </>
);

export default Header;
