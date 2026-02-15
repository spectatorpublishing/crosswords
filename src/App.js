import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Ping XML-API
import XML from "./XML";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/crosswords" replace />} />
        <Route path="/crosswords" element={<XML />} />
      </Routes>
    </Router>
  );
}

export default App;
