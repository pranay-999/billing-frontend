import React, { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

const API_BASE = "https://billing-backend-70ae.onrender.com";

const ImportExport = () => {
  const [importedData, setImportedData] = useState([]);

  // 🔹 Export STOCK DATA to Excel
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_all_stock`);
      const stock = res.data;

      if (!stock || stock.length === 0) {
        alert("No stock data available to export!");
        return;
      }

      const sheetData = stock.map((s) => ({
        ID: s[0],
        Design_Name: s[1],
        Type: s[2],
        Size: s[3],
        Stock: s[4],
        Unit_Price: s[5],
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, "inventory_stock.xlsx");
      alert("✅ Stock exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Error exporting stock data");
    }
  };

  // 🔹 IMPORT STOCK DATA from Excel file
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setImportedData(json);

      let success = 0;
      let failed = 0;

      for (let row of json) {
        try {
          await axios.post(`${API_BASE}/add_stock`, {
            design_name: row.Design_Name,
            type: row.Type,
            size: row.Size,
            stock: Number(row.Stock),
            unit_price: Number(row.Unit_Price),
          });
          success++;
        } catch (err) {
          console.error("Error importing row:", err);
          failed++;
        }
      }

      alert(`✅ Import completed! Added/Updated: ${success}, Failed: ${failed}`);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        📦 Import / Export Inventory
      </Typography>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6">Export Inventory Stock</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Download your current stock data as an Excel file.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleExport}
        >
          Export as Excel
        </Button>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6">Import Inventory Stock</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Upload your new stock Excel file to update or add inventory.
        </Typography>
        <Button
          variant="outlined"
          component="label"
          color="secondary"
          sx={{ mt: 2 }}
        >
          Upload Excel File
          <input
            type="file"
            accept=".xlsx, .xls"
            hidden
            onChange={handleImport}
          />
        </Button>

        {importedData.length > 0 && (
          <Typography sx={{ mt: 2 }}>
            Imported {importedData.length} stock items.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ImportExport;
