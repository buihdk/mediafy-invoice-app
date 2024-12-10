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
import NewClientModal from "../components/NewClientModal";
import UpdateClientModal from "../components/UpdateClientModal";

export default function MainPage() {
  const [clients, setClients] = useState([]);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [updateClientModalOpen, setUpdateClientModalOpen] = useState(false);
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

  // Updated: Show confirmation dialog before deleting
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
        width: 450,
      },
      { field: "email", headerName: "Email", width: 120 },
      { field: "phone", headerName: "Phone", width: 120 },
      { field: "dueMonthly", headerName: "Due Monthly", width: 120 },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Edit" placement="top" disableInteractive>
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedClientId(params.row.id);
                  setUpdateClientModalOpen(true);
                }}
              >
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Services" placement="top" disableInteractive>
              <IconButton
                color="success"
                size="small"
                onClick={() => navigate(`/services/${params.row.id}`)}
              >
                <Receipt />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="top" disableInteractive>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDeleteClick(params.row.id)}
                // onClick={() => handleDeleteClient(params.row.id)}
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

  return (
    <Box p={2}>
      <Box mb={2}>
        <Button variant="contained" onClick={() => setNewClientModalOpen(true)}>
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
            backgroundColor: "#f0fbfe", // a light gray shade
          },
        }}
      />

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
