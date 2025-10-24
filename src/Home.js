import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import {
  ReceiptLong,
  EditNote,
  Dashboard,
  Print,
  ImportExport,
  Inventory2,
} from "@mui/icons-material"; // <-- icons
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  // Page data with icon components
  const pages = [
    { label: "Add Bill", path: "/add-bill", icon: <ReceiptLong sx={{ fontSize: 48, color: "#0d6efd" }} /> },
    { label: "Modify Bill", path: "/modify-bill", icon: <EditNote sx={{ fontSize: 48, color: "#0d6efd" }} /> },
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard sx={{ fontSize: 48, color: "#0d6efd" }} /> },
    { label: "Print Bill", path: "/print-bill", icon: <Print sx={{ fontSize: 48, color: "#0d6efd" }} /> },
    { label: "Import / Export", path: "/import-export", icon: <ImportExport sx={{ fontSize: 48, color: "#0d6efd" }} /> },
    { label: "Stock Management", path: "/stock", icon: <Inventory2 sx={{ fontSize: 48, color: "#0d6efd" }} /> },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          background: "linear-gradient(90deg, #007bff 0%, #6610f2 100%)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            🧾 Tiles & Sanitary Billing System
          </Typography>
          <Typography variant="body2">Powered by Flask + React</Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          color="primary"
        >
          Welcome to Billing Control Center
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          mb={5}
        >
          Manage your entire billing workflow — from stock to invoices — in one
          place.
        </Typography>

        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {pages.map((page, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper
                elevation={6}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "#f8f9fa",
                  },
                }}
                onClick={() => navigate(page.path)}
              >
                <Box mb={2}>{page.icon}</Box>
                <Typography
                  variant="h5"
                  sx={{ color: "#0d6efd", fontWeight: 700, letterSpacing: 0.5 }}
                >
                  {page.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 2.5,
          textAlign: "center",
          bgcolor: "#f1f3f5",
          color: "#495057",
          fontSize: 14,
          borderTop: "1px solid #dee2e6",
        }}
      >
        © {new Date().getFullYear()} Tiles & Sanitary Billing System — Designed by Pranay
      </Box>
    </Box>
  );
};

export default Home;
