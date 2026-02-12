import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import FullPage from "./pages/FullPage";
import MinisPage from "./pages/MinisPage";


function App() {
  return (
    <>
      <nav style={{ padding: 16, display: "flex", gap: 12 }}>
        <Link to="/">Crosswords</Link>
        <Link to="/minis">Minis</Link>
      </nav>

      <Routes>
        <Route path="/" element={<FullPage />} />
        <Route path="/minis" element={<MinisPage />} />
      </Routes>
    </>
  );
}

export default App;
