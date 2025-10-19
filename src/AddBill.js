import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  Divider,
  Radio,
  RadioGroup,
  FormLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const API_BASE = "https://billing-backend-70ae.onrender.com";

export default function AddBill() {
  const [form, setForm] = useState({
    design_name: "",
    type: "",
    size: "",
    stock: "",
    unit_price: "",
    boxes_sold: "",
    amount: "",
  });

  const [entries, setEntries] = useState([]);
  const [snapshotBeforeGst, setSnapshotBeforeGst] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstMode, setGstMode] = useState("exclusive");
  const [gstLocked, setGstLocked] = useState(false);

  const [totalBeforeGst, setTotalBeforeGst] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [billNumber, setBillNumber] = useState(1);
  const [billDate, setBillDate] = useState("");
  const [designList, setDesignList] = useState([]);

  // UI States
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const today = new Date();
    setBillDate(today.toISOString().split("T")[0]);
    setBillNumber(Math.floor(Math.random() * 1000) + 1);
  }, []);

  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await axios.get(`${API_BASE}/get_all_stock`);
        const list = res.data.map((s) => ({
          id: s[0],
          design_name: s[1],
          type: s[2],
          size: s[3],
          stock: s[4],
        }));
        setDesignList(list);
      } catch (e) {
        console.error("Error fetching stock:", e);
      }
    }
    fetchStock();
  }, []);

  useEffect(() => {
    const total = entries.reduce((sum, it) => sum + Number(it.amount || 0), 0);
    setTotalBeforeGst(total);

    if (!gstEnabled) {
      setCgst(0);
      setSgst(0);
      setGrandTotal(total);
      return;
    }

    if (gstMode === "exclusive") {
      const c = total * 0.09;
      const s = total * 0.09;
      setCgst(c);
      setSgst(s);
      setGrandTotal(total + c + s);
    } else {
      const base = total / 1.18;
      const c = base * 0.09;
      const s = base * 0.09;
      setCgst(c);
      setSgst(s);
      setGrandTotal(total);
    }
  }, [entries, gstEnabled, gstMode]);

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      if ((name === "unit_price" || name === "boxes_sold") && next.unit_price && next.boxes_sold) {
        next.amount = (Number(next.unit_price) * Number(next.boxes_sold)).toFixed(2);
      }
      return next;
    });
  }

  function onDesignSelect(_, value) {
    if (!value) {
      setForm({
        design_name: "",
        type: "",
        size: "",
        stock: "",
        unit_price: "",
        boxes_sold: "",
        amount: "",
      });
      return;
    }
    setForm({
      design_name: value.design_name,
      type: value.type,
      size: value.size,
      stock: value.stock,
      unit_price: "",
      boxes_sold: "",
      amount: "",
      id: value.id,
    });
  }

  function handleAddItem() {
    if (!form.design_name || !form.unit_price || !form.boxes_sold) {
      setSnackbar({ open: true, message: "Fill design, unit price & boxes sold.", severity: "warning" });
      return;
    }
    if (Number(form.boxes_sold) > Number(form.stock)) {
      setSnackbar({ open: true, message: "Cannot sell more than stock.", severity: "error" });
      return;
    }

    const entry = {
      design_name: form.design_name,
      type: form.type,
      size: form.size,
      stock: Number(form.stock || 0),
      unit_price: parseFloat(form.unit_price).toFixed(2),
      boxes_sold: Number(form.boxes_sold),
      amount: parseFloat(form.amount).toFixed(2),
      id: form.id || null,
    };

    let newEntries;
    if (editingIndex !== null) {
      newEntries = [...entries];
      newEntries[editingIndex] = entry;
      setEditingIndex(null);
    } else {
      newEntries = [...entries, entry];
    }

    setEntries(newEntries);
    setSnapshotBeforeGst((snap) => (snap ? snap : newEntries.slice()));
    setForm({
      design_name: "",
      type: "",
      size: "",
      stock: "",
      unit_price: "",
      boxes_sold: "",
      amount: "",
    });
  }

  function handleModify(index) {
    const e = entries[index];
    setForm({ ...e });
    setEditingIndex(index);
  }

  function handleDelete(index) {
    const copy = [...entries];
    copy.splice(index, 1);
    setEntries(copy);
  }

  function handleAdjustUnitPrice() {
    if (!gstEnabled || gstMode !== "inclusive") return;
    if (entries.length === 0) {
      setSnackbar({ open: true, message: "No items to adjust.", severity: "warning" });
      return;
    }
    if (!snapshotBeforeGst) setSnapshotBeforeGst(entries.slice());

    const adjusted = entries.map((it) => {
      const base = Number((Number(it.unit_price) / 1.18).toFixed(2));
      const amount = Number((base * it.boxes_sold).toFixed(2));
      return { ...it, unit_price: base.toFixed(2), amount: amount.toFixed(2) };
    });
    setEntries(adjusted);
    setGstMode("exclusive");
    setGstLocked(true);
    setSnackbar({ open: true, message: "Adjusted to base (exclusive). GST locked.", severity: "info" });
  }

  function handleGstToggleChange(next) {
    if (!next) {
      if (snapshotBeforeGst) {
        setEntries(snapshotBeforeGst.slice());
        setSnapshotBeforeGst(null);
      }
      setGstEnabled(false);
      setGstLocked(false);
      setGstMode("exclusive");
    } else {
      if (!snapshotBeforeGst) setSnapshotBeforeGst(entries.slice());
      setGstEnabled(true);
    }
  }

  async function handleSaveBill() {
    if (entries.length === 0) {
      setSnackbar({ open: true, message: "No items to save.", severity: "warning" });
      return;
    }

    try {
      for (const it of entries) {
        await axios.post(`${API_BASE}/add_sale`, {
          design_name: it.design_name,
          type: it.type,
          size: it.size,
          boxes_sold: it.boxes_sold,
          unit_price: Number(it.unit_price),
          gst_mode: gstEnabled ? gstMode : "",
        });
        if (it.id) {
          const newStock = Number(it.stock) - Number(it.boxes_sold);
          await axios.put(`${API_BASE}/update_stock/${it.id}`, {
            design_name: it.design_name,
            type: it.type,
            size: it.size,
            stock: newStock,
            unit_price: Number(it.unit_price),
          });
        }
      }

      setSnackbar({
        open: true,
        message: `✅ Bill saved successfully! Grand total ₹${grandTotal.toFixed(2)}`,
        severity: "success",
      });

      // Reset all
      setEntries([]);
      setSnapshotBeforeGst(null);
      setGstEnabled(false);
      setGstMode("exclusive");
      setGstLocked(false);
      setTotalBeforeGst(0);
      setCgst(0);
      setSgst(0);
      setGrandTotal(0);
      setForm({
        design_name: "",
        type: "",
        size: "",
        stock: "",
        unit_price: "",
        boxes_sold: "",
        amount: "",
      });
      setEditingIndex(null);
    } catch (e) {
      console.error("Error saving bill:", e);
      setSnackbar({ open: true, message: "❌ Error saving bill.", severity: "error" });
    }
  }

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", boxShadow: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          🧾 Bill No: {billNumber}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography fontWeight="bold">{billDate}</Typography>
        </Box>
      </Paper>

      <Box display="flex" gap={3}>
        {/* Left Form */}
        <Paper sx={{ p: 2, width: 360, boxShadow: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Add Item
          </Typography>

          <Box mt={1} display="flex" flexDirection="column" gap={1.2}>
            <Autocomplete
              options={designList}
              getOptionLabel={(o) => o.design_name}
              onChange={onDesignSelect}
              value={form.design_name ? { design_name: form.design_name } : null}
              renderInput={(params) => <TextField {...params} label="Design Name" size="small" />}
            />
            <TextField label="Size" name="size" value={form.size} onChange={onFormChange} size="small" />
            <TextField label="Type" name="type" value={form.type} onChange={onFormChange} size="small" />
            <TextField label="Boxes Left" value={form.stock || "-"} disabled size="small" />
            <TextField label="Unit Price (₹)" name="unit_price" value={form.unit_price} onChange={onFormChange} size="small" />
            <TextField label="Boxes Sold" name="boxes_sold" value={form.boxes_sold} onChange={onFormChange} size="small" />
            <TextField label="Amount (₹)" name="amount" value={form.amount} disabled size="small" />

            <Box mt={1} display="flex" flexDirection="column" gap={1}>
              <Button variant="contained" onClick={handleAddItem}>
                {editingIndex !== null ? "UPDATE ITEM" : "ADD ITEM"}
              </Button>
              <Button variant="contained" color="success" onClick={() => setOpenSaveConfirm(true)}>
                SAVE BILL
              </Button>
              <Button variant="outlined" color="error" onClick={() => setOpenCancelConfirm(true)}>
                CANCEL
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Right Section */}
        <Paper sx={{ flex: 1, p: 2, boxShadow: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Current Bill Items
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Design</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Unit ₹</TableCell>
                <TableCell align="right">Boxes</TableCell>
                <TableCell align="right">Amount ₹</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell>{it.design_name}</TableCell>
                  <TableCell>{it.size}</TableCell>
                  <TableCell>{it.type}</TableCell>
                  <TableCell align="right">{it.unit_price}</TableCell>
                  <TableCell align="right">{it.boxes_sold}</TableCell>
                  <TableCell align="right">{it.amount}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleModify(idx)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No items added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <FormControlLabel
                control={<Switch checked={gstEnabled} onChange={(e) => handleGstToggleChange(e.target.checked)} />}
                label="Apply GST (18%)"
              />
              {gstEnabled && (
                <>
                  <FormLabel>GST Mode</FormLabel>
                  <RadioGroup
                    row
                    value={gstMode}
                    onChange={(e) => {
                      if (gstLocked && e.target.value === "inclusive") return;
                      setGstMode(e.target.value);
                    }}
                  >
                    <FormControlLabel value="exclusive" control={<Radio />} label="Exclusive" />
                    <FormControlLabel value="inclusive" control={<Radio />} label="Inclusive" />
                  </RadioGroup>

                  {gstMode === "inclusive" && !gstLocked && (
                    <Button size="small" variant="outlined" onClick={handleAdjustUnitPrice}>
                      Adjust Unit Price
                    </Button>
                  )}
                </>
              )}
            </Box>

            <Box textAlign="right">
              <Typography variant="h6">Total: ₹{totalBeforeGst.toFixed(2)}</Typography>
              {gstEnabled && (
                <>
                  <Typography>CGST (9%): ₹{cgst.toFixed(2)}</Typography>
                  <Typography>SGST (9%): ₹{sgst.toFixed(2)}</Typography>
                </>
              )}
              <Typography variant="h5" fontWeight="bold" color="primary" mt={1}>
                Grand Total: ₹{grandTotal.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Save Confirm */}
      <Dialog open={openSaveConfirm} onClose={() => setOpenSaveConfirm(false)}>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogContent>Are you sure you want to save this bill?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveConfirm(false)}>No</Button>
          <Button onClick={() => { setOpenSaveConfirm(false); handleSaveBill(); }} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirm */}
      <Dialog open={openCancelConfirm} onClose={() => setOpenCancelConfirm(false)}>
        <DialogTitle>Cancel Bill</DialogTitle>
        <DialogContent>Do you want to cancel and clear this bill?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelConfirm(false)}>No</Button>
          <Button
            color="error"
            onClick={() => {
              setOpenCancelConfirm(false);
              setEntries([]);
              setSnapshotBeforeGst(null);
              setGstEnabled(false);
              setGstMode("exclusive");
              setGstLocked(false);
              setTotalBeforeGst(0);
              setCgst(0);
              setSgst(0);
              setGrandTotal(0);
              setForm({
                design_name: "",
                type: "",
                size: "",
                stock: "",
                unit_price: "",
                boxes_sold: "",
                amount: "",
              });
              setEditingIndex(null);
            }}
            autoFocus
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
