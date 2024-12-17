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
  Typography,
} from "@mui/material";
import { Create, Delete, Receipt, Payments } from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import ClientModal from "../components/ClientModal";
import { db } from "../firebase";
import { formatPhoneNumber, formatMoney } from "../helpers";

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

  const fetchLatestAgreementNumber = async (clientId) => {
    try {
      const agreementsRef = collection(db, "clients", clientId, "agreements");
      const q = query(
        agreementsRef,
        orderBy("agreementNumber", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestAgreement = querySnapshot.docs[0].data();
        return latestAgreement.agreementNumber;
      }
      return null; // No agreements
    } catch (e) {
      console.error("Error fetching latest agreement:", e);
      return null;
    }
  };

  const handleRecentPaymentsClick = async (clientId) => {
    const latestAgreementNumber = await fetchLatestAgreementNumber(clientId);
    if (latestAgreementNumber !== null) {
      navigate(`/payments/${clientId}/${latestAgreementNumber}`);
    } else {
      alert("No agreements found for this client.");
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      await addDoc(collection(db, "clients"), {
        ...clientData,
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
        flex: 1,
        renderCell: (params) => {
          if (!params.row) return "";
          const { address, address2, city, state, zip } = params.row;
          const addr2 = address2 ? ` ${address2},` : "";
          return `${address || ""}${addr2} ${city || ""}, ${state || ""} ${
            zip || ""
          }`.trim();
        },
      },
      { field: "email", headerName: "Email", width: 280 },
      {
        field: "phone",
        headerName: "Phone",
        width: 120,
        sortable: false,
        valueFormatter: (params) => formatPhoneNumber(params),
      },
      {
        field: "dueMonthly",
        headerName: "Due Monthly",
        width: 120,
        valueFormatter: (params) => formatMoney(params),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <Tooltip title="Recent Payments" placement="top">
              <IconButton
                color="warning"
                size="small"
                onClick={() => handleRecentPaymentsClick(params.row.id)}
              >
                <Payments />
              </IconButton>
            </Tooltip>
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
          </>
        ),
      },
    ],
    [clients]
  );

  const editingClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  const handleSubmitClient = (clientData) => {
    if (editingClient) {
      handleUpdateClient(editingClient.id, clientData);
    } else {
      handleAddClient(clientData);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h3" align="center">
        Mediafy Direct Data
      </Typography>
      <Box mt={2} mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedClientId(null);
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
            backgroundColor: "#f0fbfe",
          },
        }}
      />

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
