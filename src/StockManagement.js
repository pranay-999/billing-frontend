import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import axios from "axios";

const API_BASE = "https://billing-backend-70ae.onrender.com";

const StockManagement = () => {
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState({
    design_name: "",
    type: "",
    size: "",
    stock: "",
    unit_price: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch all stock
  const fetchStock = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_all_stock`);
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stock", err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Add new stock
  const handleAdd = async () => {
    if (!form.design_name || !form.type || !form.size || !form.unit_price) {
      alert("Please fill all required fields!");
      return;
    }
    try {
      await axios.post(`${API_BASE}/add_stock`, form);
      alert("Stock added successfully!");
      setForm({ design_name: "", type: "", size: "", stock: "", unit_price: "" });
      fetchStock();
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    }
  };

  // Edit existing stock
  const handleEdit = (item) => {
    setEditId(item[0]);
    setForm({
      design_name: item[1],
      type: item[2],
      size: item[3],
      stock: item[4],
      unit_price: item[5],
    });
  };

  // Update stock
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/update_stock/${editId}`, form);
      alert("Stock updated successfully!");
      setEditId(null);
      setForm({ design_name: "", type: "", size: "", stock: "", unit_price: "" });
      fetchStock();
    } catch (err) {
      console.error(err);
      alert("Error updating stock");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        🧱 Stock Management
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editId ? "Edit Stock Item" : "Add New Stock Item"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              label="Design Name"
              name="design_name"
              value={form.design_name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="Type" name="type" value={form.type} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="Size" name="size" value={form.size} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="Stock" name="stock" value={form.stock} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="Unit Price" name="unit_price" value={form.unit_price} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} md={1}>
            {editId ? (
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleAdd}>
                Add
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Stock
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Design Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((s, i) => (
              <TableRow key={i}>
                <TableCell>{s[0]}</TableCell>
                <TableCell>{s[1]}</TableCell>
                <TableCell>{s[2]}</TableCell>
                <TableCell>{s[3]}</TableCell>
                <TableCell>{s[4]}</TableCell>
                <TableCell>{s[5]}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleEdit(s)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default StockManagement;
