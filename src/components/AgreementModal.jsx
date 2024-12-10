// src/components/AgreementModal.jsx
import React, { useState, useEffect } from "react";
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

export default function AgreementModal({
  open,
  onClose,
  onSave,
  agreement,
  nextAgreementNumber,
}) {
  const isUpdate = Boolean(agreement);

  const [agreementData, setAgreementData] = useState({
    serviceCode: "",
    ratePerYear: "",
    duration: "",
    startDate: null,
  });

  useEffect(() => {
    if (agreement) {
      // Convert stored startDate back to a Date
      let parsedDate = null;
      if (agreement.startDate) {
        const parts = agreement.startDate.split("/");
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          parsedDate = new Date(year, month, day);
        }
      }

      setAgreementData({
        serviceCode: agreement.serviceCode || "",
        ratePerYear: agreement.ratePerYear || "",
        duration: agreement.duration?.toString() || "",
        startDate: parsedDate,
      });
    } else {
      setAgreementData({
        serviceCode: "",
        ratePerYear: "",
        duration: "",
        startDate: null,
      });
    }
  }, [agreement]);

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
    endDate.setMonth(endDate.getMonth() + duration - 1);

    const ratePerMonth = (ratePerYear / duration).toFixed(2);

    onSave({
      agreementNumber: isUpdate
        ? agreement.agreementNumber
        : nextAgreementNumber,
      serviceCode: agreementData.serviceCode,
      ratePerYear: agreementData.ratePerYear,
      duration,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      ratePerMonth,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isUpdate ? "Update Agreement" : "New Agreement"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          sx={{ marginTop: "10px" }}
          label="Agreement Number"
          value={isUpdate ? agreement.agreementNumber : nextAgreementNumber}
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
          type="number"
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
        <Button onClick={handleSave}>{isUpdate ? "Save" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
}
