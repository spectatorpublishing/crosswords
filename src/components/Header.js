import React from "react";
import spectatorLogo from "../images/spectator-logo.png";

const Header = () => {
  return (
    <header
      style={{
        boxShadow: "0 4px 2px rgba(0,0,0,0.5)",
        marginBottom: "30px",
        padding: "15px 20px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <img
        src={spectatorLogo}
        alt="Spectator Logo"
        style={{ height: "50px" }}
      />
    </header>
  );
};

export default Header;
