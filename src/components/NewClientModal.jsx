// src/components/NewClientModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function NewClientModal({ open, onClose, onSave }) {
  const [clientData, setClientData] = useState({
    name: "",
    address: "",
    phone: "",
    contact: "",
    dueMonthly: "",
    lastPaymentDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(clientData);
    setClientData({
      name: "",
      address: "",
      phone: "",
      contact: "",
      dueMonthly: "",
      lastPaymentDate: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Client</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, width: 500 }}
      >
        <TextField
          label="Business Name"
          name="name"
          value={clientData.name}
          onChange={handleChange}
        />
        <TextField
          label="Address"
          name="address"
          value={clientData.address}
          onChange={handleChange}
        />
        <TextField
          label="Address 2"
          name="address2"
          value={clientData.address2}
          onChange={handleChange}
        />
        <TextField
          label="City"
          name="city"
          value={clientData.city}
          onChange={handleChange}
        />
        <TextField
          label="State"
          name="state"
          value={clientData.state}
          onChange={handleChange}
        />
        <TextField
          label="Zip"
          name="zip"
          value={clientData.zip}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          value={clientData.email}
          onChange={handleChange}
        />
        <TextField
          label="Phone"
          name="phone"
          value={clientData.phone}
          onChange={handleChange}
        />
        <TextField
          label="Cell"
          name="cell"
          value={clientData.cell}
          onChange={handleChange}
        />
        <TextField
          label="Person of Contact"
          name="contact"
          value={clientData.contact}
          onChange={handleChange}
        />
        <TextField
          label="Due Monthly"
          name="dueMonthly"
          value={clientData.dueMonthly}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
