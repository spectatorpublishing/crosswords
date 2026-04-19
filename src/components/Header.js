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

  @media (max-width: 640px) {
    justify-content: center;
    padding: 12px 16px;
  }
`;

const HeaderLogo = styled.img`
  height: 50px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const HeaderButton = styled.button`
  padding: 10px 20px;
  font-size: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-family: Bitter, serif;
  font-weight: bold;

  @media (max-width: 640px) {
    padding: 10px 14px;
    font-size: 18px;
  }
`;

const VerticalBar = styled.div`
  width: 1px;
  height: 30px;
  background-color: #000000;

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileVerticalBar = styled(VerticalBar)`
  @media (max-width: 640px) {
    display: block;
  }
  @media (min-width: 641px) {
    display: none;
  }
    
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderLogo src={spectatorLogo} alt="Spectator Logo" />

      <VerticalBar />

      <HeaderButton
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Crosswords
      </HeaderButton>

      <VerticalBar />
      <MobileVerticalBar />

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
