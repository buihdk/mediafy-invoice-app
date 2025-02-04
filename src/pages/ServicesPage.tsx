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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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

interface IClient {
  id: string;
  name: string;
}

interface IAgreement {
  id: string;
  agreementNumber: number;
  serviceCode?: string[];
  ratePerMonth?: string;
  ratePerYear?: string;
  budgetPerMonth?: number;
  duration?: number;
  startDate?: string;
  endDate?: string;
}

export default function ServicesPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<IClient | null>(null);
  const [agreements, setAgreements] = useState<IAgreement[]>([]);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<IAgreement | null>(
    null
  );

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchClientAndAgreements();
  }, [businessId]);

  const fetchClientAndAgreements = async () => {
    if (!businessId) return;
    try {
      const agreementsRef = collection(db, "clients", businessId, "agreements");
      const querySnapshot = await getDocs(agreementsRef);
      const agData = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as IAgreement[];

      // Fetch client data
      const clientSnap = await getDocs(collection(db, "clients"));
      const clientDoc = clientSnap.docs.find(
        (docItem) => docItem.id === businessId
      );
      setClient(
        clientDoc
          ? ({ id: clientDoc.id, ...clientDoc.data() } as IClient)
          : null
      );

      setAgreements(agData);
    } catch (e) {
      console.error("Error fetching agreements:", e);
    }
  };

  const handleAddAgreement = async (agreementData: Omit<IAgreement, "id">) => {
    if (!businessId) return;
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

  const handleUpdateAgreement = async (
    agreementId: string,
    updatedData: Partial<IAgreement>
  ) => {
    if (!businessId) return;
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

  const handleDeleteAgreement = async (id: string) => {
    if (!businessId) return;
    try {
      await deleteDoc(doc(db, "clients", businessId, "agreements", id));
      fetchClientAndAgreements();
    } catch (e) {
      console.error("Error deleting agreement:", e);
    }
  };

  const handleDeleteClick = (id: string) => {
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

  const columns = useMemo<GridColDef<IAgreement>[]>(
    () => [
      { field: "agreementNumber", headerName: "Agreement #", width: 100 },
      {
        field: "serviceCode",
        headerName: "Service(s)",
        flex: 1,
        renderCell: (params) => {
          const val = params.value || [];
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
          const row = params.row as IAgreement;
          const ratePerMonth = parseFloat(row.ratePerMonth || "0") || 0;
          const budgetPerMonth = parseFloat(String(row.budgetPerMonth)) || 0;
          return `$${(ratePerMonth + budgetPerMonth).toFixed(2)}`;
        },
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 90,
        valueFormatter: (params) => {
          const val = params as number;
          return `${val || 0} month${val > 1 ? "s" : ""}`;
        },
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
        renderCell: (params) => {
          const row = params.row as IAgreement;
          return (
            <>
              <Tooltip title="Payments" placement="top">
                <IconButton
                  color="success"
                  size="small"
                  onClick={() =>
                    navigate(`/payments/${businessId}/${row.agreementNumber}`)
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
                    setSelectedAgreement(row);
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
    [businessId]
  );

  const handleSaveAgreement = (
    agreementData: Omit<IAgreement, "id"> & { agreementNumber: number }
  ) => {
    if (selectedAgreement) {
      handleUpdateAgreement(selectedAgreement.id, agreementData);
    } else {
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
          color="success"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          sx={{ background: "#346854" }}
          variant="contained"
          onClick={() => {
            setSelectedAgreement(null);
            setAgreementModalOpen(true);
          }}
        >
          Add Agreement
        </Button>
      </Box>

      <DataGrid
        rows={agreements}
        getRowHeight={() => "auto"}
        getRowId={(row) => row.id}
        columns={columns}
        initialState={{
          sorting: {
            sortModel: [{ field: "agreementNumber", sort: "desc" }],
          },
        }}
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
        agreement={selectedAgreement || undefined}
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
