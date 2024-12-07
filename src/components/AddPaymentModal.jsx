// src/components/AddPaymentModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export default function AddPaymentModal({ open, onClose, onSave }) {
  const [paymentData, setPaymentData] = useState({
    date: null,
    amount: "",
    method: "ACH",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({
      date: paymentData.date
        ? new Date(paymentData.date).toLocaleDateString()
        : "",
      amount: paymentData.amount,
      method: paymentData.method,
    });
    setPaymentData({ date: null, amount: "", method: "ACH" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Payment</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <DatePicker
          label="Date"
          value={paymentData.date}
          onChange={(newValue) =>
            setPaymentData((prev) => ({ ...prev, date: newValue }))
          }
          renderInput={(params) => <TextField {...params} />}
        />
        <TextField
          label="Amount"
          name="amount"
          value={paymentData.amount}
          onChange={handleChange}
        />
        <TextField
          select
          label="Method"
          name="method"
          value={paymentData.method}
          onChange={handleChange}
        >
          <MenuItem value="ACH">ACH</MenuItem>
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="Check">Check</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
