import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Create, Delete, Payments, ArrowBack } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  parseDate,
  dateSortComparator,
  formatDate,
  serviceCodes,
  formatMoney,
} from "../helpers";
import AgreementModal from "../components/AgreementModal";

export default function ServicesPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  // State for delete confirmation
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState(null);

  useEffect(() => {
    fetchClientAndAgreements();
  }, [businessId]);

  const fetchClientAndAgreements = async () => {
    try {
      const agreementsRef = collection(db, "clients", businessId, "agreements");
      const querySnapshot = await getDocs(agreementsRef);
      const agData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch client data
      const clientSnap = await getDocs(collection(db, "clients"));
      const clientData = clientSnap.docs.find((doc) => doc.id === businessId);
      setClient(
        clientData ? { id: clientData.id, ...clientData.data() } : null
      );

      setAgreements(agData);
    } catch (e) {
      console.error("Error fetching agreements:", e);
    }
  };

  const handleAddAgreement = async (agreementData) => {
    try {
      const agreementsRef = collection(db, "clients", businessId, "agreements");
      await addDoc(agreementsRef, {
        ...agreementData,
        payments: [],
      });
      setAgreementModalOpen(false);
      fetchClientAndAgreements();
    } catch (e) {
      console.error("Error adding agreement:", e);
    }
  };

  const handleUpdateAgreement = async (agreementId, updatedData) => {
    try {
      const agreementRef = doc(
        db,
        "clients",
        businessId,
        "agreements",
        agreementId
      );
      await updateDoc(agreementRef, updatedData);
      fetchClientAndAgreements();
    } catch (e) {
      console.error("Error updating agreement:", e);
    }
  };

  const handleDeleteAgreement = async (id) => {
    try {
      await deleteDoc(doc(db, "clients", businessId, "agreements", id));
      fetchClientAndAgreements();
    } catch (e) {
      console.error("Error deleting agreement:", e);
    }
  };

  const handleDeleteClick = (id) => {
    setAgreementToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (agreementToDelete) {
      handleDeleteAgreement(agreementToDelete);
    }
    setDeleteConfirmationOpen(false);
    setAgreementToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setAgreementToDelete(null);
  };

  const columns = useMemo(() => {
    return [
      { field: "agreementNumber", headerName: "Agreement #", width: 100 },
      {
        field: "serviceCode",
        headerName: "Service(s)",
        flex: 1,
        renderCell: (params) => {
          const val = params.row.serviceCode || [];
          if (!Array.isArray(val)) return null; // Handle invalid data
          const selectedServices = serviceCodes.filter((sc) =>
            val.includes(sc.id)
          );

          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                maxWidth: "100%",
              }}
            >
              {selectedServices.map((service) => (
                <Chip
                  key={service.id}
                  label={`${service.id} (${formatMoney(service.monthly)})`}
                  sx={{ backgroundColor: service.hex }}
                  size="small"
                />
              ))}
            </Box>
          );
        },
      },
      {
        field: "ratePerYear",
        headerName: "Rate/Year",
        width: 100,
        valueFormatter: (params) => formatMoney(params),
      },
      {
        field: "ratePerMonth",
        headerName: "Rate/Month",
        width: 100,
        valueFormatter: (params) => formatMoney(params),
      },
      {
        field: "budgetPerMonth",
        headerName: "Budget/Month",
        width: 110,
        valueFormatter: (params) => formatMoney(params),
      },
      {
        field: "invoicePerMonth",
        headerName: "Invoice/Month",
        width: 110,
        renderCell: (params) => {
          const ratePerMonth = parseFloat(params?.row?.ratePerMonth) || 0;
          const budgetPerMonth = parseFloat(params?.row?.budgetPerMonth) || 0;
          return `$${(ratePerMonth + budgetPerMonth).toFixed(2)}`;
        },
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 90,
        valueFormatter: (params) =>
          `${params || 0} month${params > 1 ? "s" : ""}`,
      },
      {
        field: "startDate",
        headerName: "Start Date",
        width: 100,
        valueGetter: (params) => parseDate(params),
        valueFormatter: (params) => formatDate(params),
        sortComparator: dateSortComparator,
      },
      {
        field: "endDate",
        headerName: "End Date",
        width: 100,
        valueGetter: (params) => parseDate(params),
        valueFormatter: (params) => formatDate(params),
        sortComparator: dateSortComparator,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <Tooltip title="Payments" placement="top">
              <IconButton
                color="success"
                size="small"
                onClick={() =>
                  navigate(
                    `/payments/${businessId}/${params.row.agreementNumber}`
                  )
                }
              >
                <Payments />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit" placement="top">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedAgreement(params.row);
                  setAgreementModalOpen(true);
                }}
              >
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(params.row.id)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ];
  }, [agreements]);

  // Decide how to handle saving the agreement (add or update)
  const handleSaveAgreement = (agreementData) => {
    if (selectedAgreement) {
      // Updating existing agreement
      handleUpdateAgreement(selectedAgreement.id, agreementData);
    } else {
      // Adding new agreement
      handleAddAgreement(agreementData);
    }
    setSelectedAgreement(null);
  };

  return (
    <Box p={2}>
      <Box mb={2}>
        <Typography variant="h5">
          {client ? client.name : "Client"} - Services
        </Typography>
      </Box>
      <Box mb={2} display="flex" gap={1} justifyContent="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")} // navigate back to main page
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedAgreement(null); // Clear selected for new
            setAgreementModalOpen(true);
          }}
        >
          Add Agreement
        </Button>
      </Box>

      <DataGrid
        height="100%"
        rows={agreements}
        getRowHeight={() => "auto"}
        columns={columns}
        disableColumnSelector={true}
        pageSize={5}
        getRowId={(row) => row.id}
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
          "& .MuiDataGrid-cell[data-field]:not([data-field='serviceCode'])": {
            margin: "auto",
          },
          "& .MuiDataGrid-cell[data-field='serviceCode']": {
            paddingTop: 1,
            paddingBottom: 1,
          },
        }}
      />

      <AgreementModal
        open={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        onSave={handleSaveAgreement}
        agreement={selectedAgreement}
        nextAgreementNumber={
          agreements.length > 0
            ? Math.max(...agreements.map((a) => a.agreementNumber)) + 1
            : 1
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmationOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Agreement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this agreement?
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
