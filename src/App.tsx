import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import SpecificReportPage from "./pages/SpecificReport";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/report/:id" element={<SpecificReportPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
