import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";

const API_BASE = "https://billing-backend-70ae.onrender.com";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard_data`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  if (!stats) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        📊 Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Total Sales</Typography>
            <Typography variant="h5" color="primary">
              ₹{stats.total_sales.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Total GST Collected</Typography>
            <Typography variant="h5" color="secondary">
              ₹{stats.total_gst.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Total Bills</Typography>
            <Typography variant="h5" color="success.main">
              {stats.total_bills}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={5}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🏆 Top Selling Products
          </Typography>
          {stats.top_products.length === 0 ? (
            <Typography>No sales data yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Design Name</TableCell>
                  <TableCell>Quantity Sold</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_products.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.design}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
