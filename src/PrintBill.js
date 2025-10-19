import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Divider } from "@mui/material";
import axios from "axios";

const API_BASE = "https://billing-backend-70ae.onrender.com";

const PrintBill = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get_sales`);
        setSales(res.data.reverse());
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };
    fetchSales();
  }, []);

  const handlePrint = (sale) => {
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
        <head>
          <title>Invoice - ${sale[1]}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            .summary { margin-top: 20px; font-size: 16px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>🧾 Tiles & Sanitary Billing System</h2>
          <h3>Invoice for: ${sale[1]}</h3>
          <table>
            <thead>
              <tr>
                <th>Design</th>
                <th>Type</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
                <th>GST Mode</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Final Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${sale[1]}</td>
                <td>${sale[2]}</td>
                <td>${sale[3]}</td>
                <td>${sale[4]}</td>
                <td>${sale[5]}</td>
                <td>${sale[6]}</td>
                <td>${sale[7]}</td>
                <td>${sale[8].toFixed(2)}</td>
                <td>${sale[9].toFixed(2)}</td>
                <td>${sale[10].toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary">
            <p><b>Total Before GST:</b> ₹${sale[6].toFixed(2)}</p>
            <p><b>CGST (9%):</b> ₹${sale[8].toFixed(2)}</p>
            <p><b>SGST (9%):</b> ₹${sale[9].toFixed(2)}</p>
            <p><b>Final Total:</b> ₹${sale[10].toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        🧾 Print Bill
      </Typography>
      {sales.length === 0 ? (
        <Typography>No bills found.</Typography>
      ) : (
        sales.map((sale) => (
          <Paper key={sale[0]} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6">
              Bill ID: {sale[0]} — {sale[1]}
            </Typography>
            <Typography>Final Amount: ₹{sale[10].toFixed(2)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Button variant="contained" onClick={() => handlePrint(sale)}>
              Print Bill
            </Button>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default PrintBill;
