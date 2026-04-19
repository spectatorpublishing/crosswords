import React from "react";
import spectatorLogo from "../images/spectator-logo.png";
import styled from "styled-components";

const HeaderContainer = styled.header`
  box-shadow: 0 4px 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 25px;
  padding: 15px 20px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const HeaderButton = styled.button`
  padding: 10px 20px;
  font-size: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-family: Bitter, serif;
  font-weight: bold;
`;

const VerticalBar = styled.div`
  width: 1px;
  height: 30px;
  background-color: #000000;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <img
        src={spectatorLogo}
        alt="Spectator Logo"
        style={{ height: "50px" }}
      />

      <VerticalBar />

      <HeaderButton
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Crosswords
      </HeaderButton>

      <VerticalBar />

      <HeaderButton
        onClick={() => {
          window.location.href = "/minis";
        }}
      >
        Minis
      </HeaderButton>
    </HeaderContainer>
  );
};

export default Header;
