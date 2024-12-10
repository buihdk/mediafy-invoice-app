// src/components/ClientModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputAdornment,
} from "@mui/material";

export default function ClientModal({ open, onClose, onSubmit, client }) {
  const isUpdate = Boolean(client);

  const [data, setData] = useState({
    name: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
    cell: "",
    contact: "",
    dueMonthly: "",
    lastPaymentDate: "",
  });

  useEffect(() => {
    if (client) {
      setData({
        name: client.name || "",
        address: client.address || "",
        address2: client.address2 || "",
        city: client.city || "",
        state: client.state || "",
        zip: client.zip || "",
        email: client.email || "",
        phone: client.phone || "",
        cell: client.cell || "",
        contact: client.contact || "",
        dueMonthly: client.dueMonthly || "",
        lastPaymentDate: client.lastPaymentDate || "",
      });
    } else {
      // Clear if new
      setData({
        name: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        email: "",
        phone: "",
        cell: "",
        contact: "",
        dueMonthly: "",
        lastPaymentDate: "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSubmit(data);
    if (!isUpdate) {
      // Reset if a new client was just created
      setData({
        name: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        email: "",
        phone: "",
        cell: "",
        contact: "",
        dueMonthly: "",
        lastPaymentDate: "",
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isUpdate ? "Update Client" : "New Client"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: 500 }}
      >
        <TextField
          sx={{ marginTop: "10px" }}
          label="Business Name"
          name="name"
          value={data.name}
          onChange={handleChange}
        />
        <TextField
          label="Address"
          name="address"
          value={data.address}
          onChange={handleChange}
        />
        <TextField
          label="Address 2"
          name="address2"
          value={data.address2}
          onChange={handleChange}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="City"
            name="city"
            value={data.city}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="State"
            name="state"
            value={data.state}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Zip"
            name="zip"
            value={data.zip}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={data.email}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Phone"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Cell"
            name="cell"
            value={data.cell}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Person of Contact"
            name="contact"
            value={data.contact}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            type="number"
            label="Due Monthly"
            name="dueMonthly"
            value={data.dueMonthly}
            onChange={handleChange}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{isUpdate ? "Save" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
}
