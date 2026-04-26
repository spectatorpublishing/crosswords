import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FullPage from "./pages/FullPage";
import MinisPage from "./pages/MinisPage";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<FullPage />} />
        <Route path="/minis" element={<MinisPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
