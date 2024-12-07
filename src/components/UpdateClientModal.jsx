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
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
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
          label="Phone"
          name="phone"
          value={data.phone}
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
        <TextField
          label="Last Payment Date"
          name="lastPaymentDate"
          value={data.lastPaymentDate}
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
