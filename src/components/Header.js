import React from "react";
import spectatorLogo from "../images/spectator-logo.png";

const Header = ({ mode }) => {
  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    fontSize: "20px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: isActive ? "3px solid black" : "3px solid transparent",
    cursor: "pointer",
    fontFamily: "Bitter, serif",
    fontWeight: "bold",
  });

  return (
    <header
      style={{
        boxShadow: "0 4px 2px rgba(0,0,0,0.5)",
        marginBottom: "25px",
        padding: "15px 20px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      }}
    >
      <img
        src={spectatorLogo}
        alt="Spectator Logo"
        style={{ height: "50px" }}
      />

      <div
        style={{
          width: "1px",
          height: "30px",
          backgroundColor: "#000000",
        }}
      />

      <button
        style={tabStyle(mode === "full" || mode === "all")}
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Crosswords
      </button>

      <div
        style={{
          width: "1px",
          height: "30px",
          backgroundColor: "#000000",
        }}
      />

      <button
        style={tabStyle(mode === "mini")}
        onClick={() => {
          window.location.href = "/minis";
        }}
      >
        Minis
      </button>
    </header>
  );
};

export default Header;