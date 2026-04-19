import React from "react";
import { Routes, Route } from "react-router-dom";
import FullPage from "./pages/FullPage";
import MinisPage from "./pages/MinisPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FullPage />} />
        <Route path="/minis" element={<MinisPage />} />
      </Routes>
    </>
  );
}

export default App;
