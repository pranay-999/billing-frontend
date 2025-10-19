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

const ModifyBill = () => {
  const [sales, setSales] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({});

  // Fetch sales on load
  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_sales`);
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales", err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // When user clicks edit
  const handleEdit = (row) => {
    setEditRow(row[0]);
    setForm({
      design_name: row[1],
      type: row[2],
      size: row[3],
      boxes_sold: row[4],
      unit_price: row[5],
      gst_mode: row[7],
    });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/update_sale/${editRow}`, form);
      alert("Sale updated successfully!");
      setEditRow(null);
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("Error updating sale");
    }
  };

  // Delete a sale
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    try {
      await axios.delete(`${API_BASE}/delete_sale/${id}`);
      alert("Sale deleted successfully!");
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("Error deleting sale");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        ✏️ Modify Bill
      </Typography>

      {editRow ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Edit Sale</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6} md={4}>
              <TextField
                label="Design Name"
                name="design_name"
                value={form.design_name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Boxes Sold"
                name="boxes_sold"
                value={form.boxes_sold}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Unit Price"
                name="unit_price"
                value={form.unit_price}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="GST Mode"
                name="gst_mode"
                value={form.gst_mode}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setEditRow(null)}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      ) : null}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Sales
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Design</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Final</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row[0]}</TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell>{row[2]}</TableCell>
                <TableCell>{row[3]}</TableCell>
                <TableCell>{row[4]}</TableCell>
                <TableCell>{row[5]}</TableCell>
                <TableCell>{row[7]}</TableCell>
                <TableCell>{row[10].toFixed(2)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(row)}>Edit</Button>
                  <Button color="error" onClick={() => handleDelete(row[0])}>
                    Delete
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

export default ModifyBill;
