import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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

interface Client {
  id: string;
  name: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  cell?: string;
  contact?: string;
  dueMonthly?: string | number;
  lastPaymentDate?: string;
  [key: string]: any;
}

export default function MainPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Client[];
      setClients(data);
    } catch (e) {
      console.error("Error fetching clients:", e);
    }
  };

  const fetchLatestAgreementNumber = async (clientId: string) => {
    try {
      const agreementsRef = collection(db, "clients", clientId, "agreements");
      const q = query(
        agreementsRef,
        orderBy("agreementNumber", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestAgreement = querySnapshot.docs[0].data() as {
          agreementNumber: number;
        };
        return latestAgreement.agreementNumber;
      }
      return null; // No agreements
    } catch (e) {
      console.error("Error fetching latest agreement:", e);
      return null;
    }
  };

  const handleRecentPaymentsClick = async (clientId: string) => {
    const latestAgreementNumber = await fetchLatestAgreementNumber(clientId);
    if (latestAgreementNumber !== null) {
      navigate(`/payments/${clientId}/${latestAgreementNumber}`);
    } else {
      alert("No agreements found for this client.");
    }
  };

  const handleAddClient = async (clientData: Omit<Client, "id">) => {
    try {
      await addDoc(collection(db, "clients"), clientData);
      fetchClients();
    } catch (e) {
      console.error("Error adding client:", e);
    }
  };

  const handleUpdateClient = async (
    clientId: string,
    updatedData: Partial<Client>
  ) => {
    try {
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, updatedData);
      fetchClients();
    } catch (e) {
      console.error("Error updating client:", e);
    }
  };

  const handleDeleteClick = (id: string) => {
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

  const columns = useMemo<GridColDef[]>(
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
          const row = params.row as Client;
          const { address, address2, city, state, zip } = row;
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
        renderCell: (params) => {
          const row = params.row as Client;
          return (
            <>
              <Tooltip title="Recent Payments" placement="top">
                <IconButton
                  color="warning"
                  size="small"
                  onClick={() => handleRecentPaymentsClick(row.id)}
                >
                  <Payments />
                </IconButton>
              </Tooltip>
              <Tooltip title="Services" placement="top">
                <IconButton
                  color="success"
                  size="small"
                  onClick={() => navigate(`/services/${row.id}`)}
                >
                  <Receipt />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" placement="top">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    setSelectedClientId(row.id);
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
                  onClick={() => handleDeleteClick(row.id)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          );
        },
      },
    ],
    []
  );

  const editingClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  const handleSubmitClient = (clientData: any) => {
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
          sx={{ background: "#346854" }}
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
        columnVisibilityModel={{ id: false }}
        rows={clients}
        columns={columns}
        sx={{
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#346854",
            color: "#fff",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f8f9fa",
          },
          "& .MuiDataGrid-cell": {
            borderTop: "unset",
          },
        }}
      />

      <ClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSubmit={handleSubmitClient}
        client={editingClient || undefined}
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
