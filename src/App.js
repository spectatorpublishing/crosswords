import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FullPage from "./pages/FullPage";
import MinisPage from "./pages/MinisPage";
import PuzzlePage from "./pages/PuzzlePage";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crosswords" element={<FullPage />} />
        <Route path="/minis" element={<MinisPage />} />
        <Route path="/puzzle/:id" element={<PuzzlePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
