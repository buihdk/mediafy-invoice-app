// src/components/AddAgreementModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export default function AddAgreementModal({
  open,
  onClose,
  onSave,
  nextAgreementNumber,
}) {
  const [agreementData, setAgreementData] = useState({
    serviceCode: "",
    ratePerYear: "",
    duration: "",
    startDate: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgreementData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const duration = parseInt(agreementData.duration, 10) || 1;
    const ratePerYear = parseFloat(agreementData.ratePerYear) || 0;

    const startDate = agreementData.startDate
      ? new Date(agreementData.startDate)
      : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const ratePerMonth = (ratePerYear / duration).toFixed(2);

    onSave({
      agreementNumber: nextAgreementNumber,
      serviceCode: agreementData.serviceCode,
      ratePerYear: agreementData.ratePerYear,
      duration,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      ratePerMonth,
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Agreement</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Agreement Number"
          value={nextAgreementNumber}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Service Code"
          name="serviceCode"
          value={agreementData.serviceCode}
          onChange={handleChange}
        />
        <TextField
          label="Rate per Year"
          name="ratePerYear"
          value={agreementData.ratePerYear}
          onChange={handleChange}
        />
        <TextField
          label="Duration (months)"
          name="duration"
          value={agreementData.duration}
          onChange={handleChange}
        />
        <DatePicker
          label="Start Date"
          value={agreementData.startDate}
          onChange={(newValue) =>
            setAgreementData((prev) => ({ ...prev, startDate: newValue }))
          }
          renderInput={(params) => <TextField {...params} />}
        />
        <Typography variant="body2">
          End Date and Rate/Month will be auto-calculated on save.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
