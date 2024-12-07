// src/pages/MainPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Tooltip, IconButton } from "@mui/material";
import { Create } from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import NewClientModal from "../components/NewClientModal";
import UpdateClientModal from "../components/UpdateClientModal";

export default function MainPage() {
  const [clients, setClients] = useState([]);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [updateClientModalOpen, setUpdateClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClients(data);
    } catch (e) {
      console.error("Error fetching clients:", e);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      await addDoc(collection(db, "clients"), {
        name: clientData.name,
        address: clientData.address,
        phone: clientData.phone,
        contact: clientData.contact,
        dueMonthly: clientData.dueMonthly || "0",
        lastPaymentDate: clientData.lastPaymentDate || "",
      });
      fetchClients();
    } catch (e) {
      console.error("Error adding client:", e);
    }
  };

  const handleUpdateClient = async (clientId, updatedData) => {
    try {
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, updatedData);
      fetchClients();
    } catch (e) {
      console.error("Error updating client:", e);
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await deleteDoc(doc(db, "clients", id));
      fetchClients();
    } catch (e) {
      console.error("Error deleting client:", e);
    }
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Business ID", width: 100, hide: true },
      {
        field: "name",
        headerName: "Business Name",
        width: 450,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>{params.value}</span>
            <Tooltip title="Edit" placement="top" disableInteractive>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedClientId(params.row.id);
                  setUpdateClientModalOpen(true);
                }}
              >
                <Create />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteClient(params.row.id)}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/services/${params.row.id}`)}
            >
              Services
            </Button>
          </Box>
        ),
      },
      { field: "dueMonthly", headerName: "Due Monthly", width: 120 },
    ],
    [clients]
  );

  return (
    <Box p={2}>
      <Box mb={2}>
        <Button variant="contained" onClick={() => setNewClientModalOpen(true)}>
          New Client
        </Button>
      </Box>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={clients}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>

      <NewClientModal
        open={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        onSave={handleAddClient}
      />

      {updateClientModalOpen && (
        <UpdateClientModal
          open={updateClientModalOpen}
          onClose={() => setUpdateClientModalOpen(false)}
          clientId={selectedClientId}
          onUpdate={handleUpdateClient}
          clients={clients}
        />
      )}
    </Box>
  );
}
