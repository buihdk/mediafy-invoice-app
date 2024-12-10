// src/components/UpdateClientModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function UpdateClientModal({
  open,
  onClose,
  clientId,
  onUpdate,
  clients,
}) {
  const client = clients.find((c) => c.id === clientId);
  const [data, setData] = useState({
    name: "",
    address: "",
    phone: "",
    contact: "",
    dueMonthly: "",
    lastPaymentDate: "",
  });

  useEffect(() => {
    if (client) {
      setData({
        name: client.name || "",
        address: client.address || "",
        email: client.email || "",
        phone: client.phone || "",
        contact: client.contact || "",
        dueMonthly: client.dueMonthly || "",
        lastPaymentDate: client.lastPaymentDate || "",
      });
    }
  }, [client]);

  const handleUpdate = () => {
    onUpdate(clientId, data);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Client</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, width: 500 }}
      >
        <TextField
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
        <TextField
          label="City"
          name="city"
          value={data.city}
          onChange={handleChange}
        />
        <TextField
          label="State"
          name="state"
          value={data.state}
          onChange={handleChange}
        />
        <TextField
          label="Zip"
          name="zip"
          value={data.zip}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          value={data.email}
          onChange={handleChange}
        />
        <TextField
          label="Phone"
          name="phone"
          value={data.phone}
          onChange={handleChange}
        />
        <TextField
          label="Cell"
          name="cell"
          value={data.cell}
          onChange={handleChange}
        />
        <TextField
          label="Person of Contact"
          name="contact"
          value={data.contact}
          onChange={handleChange}
        />
        <TextField
          label="Due Monthly"
          name="dueMonthly"
          value={data.dueMonthly}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
