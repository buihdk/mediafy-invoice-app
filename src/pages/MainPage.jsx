// src/pages/MainPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Create, Delete, Receipt } from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import ClientModal from "../components/ClientModal";

export default function MainPage() {
  const [clients, setClients] = useState([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // State for delete confirmation
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

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
        address2: clientData.address2 || "",
        city: clientData.city || "",
        state: clientData.state || "",
        zip: clientData.zip || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        cell: clientData.cell || "",
        contact: clientData.contact || "",
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

  // Show confirmation dialog before deleting
  const handleDeleteClick = (id) => {
    setClientToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteDoc(doc(db, "clients", clientToDelete));
        fetchClients();
      } catch (e) {
        console.error("Error deleting client:", e);
      }
    }
    setDeleteConfirmationOpen(false);
    setClientToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setClientToDelete(null);
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Business ID", width: 100 },
      {
        field: "name",
        headerName: "Business Name",
        width: 300,
      },
      {
        field: "fullAddress",
        headerName: "Address",
        width: 450,
        renderCell: (params) => {
          if (!params.row) return '';
          const { address, address2, city, state, zip } = params.row;
          const addr2 = address2 ? ` ${address2},` : "";
          return `${address || ""}${addr2} ${city || ""}, ${state || ""} ${
            zip || ""
          }`.trim();
        },
      },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phone", headerName: "Phone", width: 200 },
      {
        field: "dueMonthly",
        headerName: "Due Monthly",
        width: 120,
        valueFormatter: (params) => `$${params || 0}`,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: "flex", marginTop: 1, gap: 1 }}>
            <Tooltip title="Services" placement="top">
              <IconButton
                color="success"
                size="small"
                onClick={() => navigate(`/services/${params.row.id}`)}
              >
                <Receipt />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit" placement="top">
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedClientId(params.row.id);
                  setClientModalOpen(true);
                }}
              >
                <Create />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete" placement="top">
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDeleteClick(params.row.id)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [clients]
  );

  // Determine which client is currently being edited
  const editingClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  // Handle submit from ClientModal
  const handleSubmitClient = (clientData) => {
    if (editingClient) {
      // Update existing client
      handleUpdateClient(editingClient.id, clientData);
    } else {
      // Add new client
      handleAddClient(clientData);
    }
  };

  return (
    <Box p={2}>
      <Box mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedClientId(null); // Clear selected ID for a new client
            setClientModalOpen(true);
          }}
        >
          New Client
        </Button>
      </Box>
      <DataGrid
        height="100%"
        columnVisibilityModel={{ id: false }}
        rows={clients}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        sx={{
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f0fbfe", // a light background shade
          },
        }}
      />

      {/* Unified Client Modal */}
      <ClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSubmit={handleSubmitClient}
        client={editingClient}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmationOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this client?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
