import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import AddBill from "./AddBill";
import ModifyBill from "./ModifyBill";
import Dashboard from "./Dashboard";
import PrintBill from "./PrintBill";
import ImportExport from "./ImportExport";
import StockManagement from "./StockManagement";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-bill" element={<AddBill />} />
        <Route path="/modify-bill" element={<ModifyBill />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/print-bill" element={<PrintBill />} />
        <Route path="/import-export" element={<ImportExport />} />
        <Route path="/stock" element={<StockManagement />} />



        
      </Routes>
    </Router>
  );
}

export default App;
