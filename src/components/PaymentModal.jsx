import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export default function PaymentModal({ open, onClose, onSave, payment }) {
  const isUpdate = Boolean(payment);

  const [paymentData, setPaymentData] = useState({
    date: null,
    amount: "",
    method: "ACH",
    note: "",
  });

  useEffect(() => {
    if (payment) {
      let parsedDate = null;
      if (payment.date) {
        const parts = payment.date.split("/");
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          const d = new Date(year, month, day);
          if (!isNaN(d.getTime())) {
            parsedDate = d;
          }
        }
      }

      setPaymentData({
        date: parsedDate,
        amount: payment.amount || "",
        method: payment.method || "ACH",
        note: payment.note || "",
      });
    } else {
      setPaymentData({ date: null, amount: "", method: "ACH", note: "" });
    }
  }, [payment]);

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
      note: paymentData.note,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isUpdate ? "Update Payment" : "New Payment"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <Box sx={{ display: "flex", gap: 2, marginTop: "10px" }}>
          <DatePicker
            label="Date"
            value={paymentData.date}
            onChange={(newValue) =>
              setPaymentData((prev) => ({ ...prev, date: newValue }))
            }
            renderInput={(params) => <TextField {...params} />}
            sx={{ width: "100%" }}
          />
          <TextField
            select
            label="Method"
            name="method"
            value={paymentData.method}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="ACH">ACH</MenuItem>
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Check">Check</MenuItem>
          </TextField>
        </Box>
        <TextField
          type="number"
          label="Amount"
          name="amount"
          value={paymentData.amount}
          onChange={handleChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Note"
          name="note"
          value={paymentData.note}
          onChange={handleChange}
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{isUpdate ? "Save" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
}
