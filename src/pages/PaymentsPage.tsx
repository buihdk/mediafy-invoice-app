import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  limit,
  updateDoc,
} from "firebase/firestore";
import { Create, Delete, ArrowBack, Home } from "@mui/icons-material";

import {
  parseDate,
  dateSortComparator,
  formatDate,
  formatMoney,
} from "../helpers";
import PaymentModal from "../components/PaymentModal";

interface ClientData {
  id: string;
  name: string;
}

interface AgreementData {
  id: string;
  agreementNumber: number;
}

interface PaymentItem {
  id: string;
  date: string;
  amount: string;
  method: string;
  note: string;
  [key: string]: any;
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { businessId, agreementNumber } = useParams<{
    businessId: string;
    agreementNumber: string;
  }>();
  const [client, setClient] = useState<ClientData | null>(null);
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(
    null
  );

  useEffect(() => {
    fetchClient();
  }, [businessId]);

  useEffect(() => {
    if (client) {
      fetchAgreement();
    }
  }, [client, agreementNumber]);

  useEffect(() => {
    if (agreement) {
      fetchPayments();
    }
  }, [agreement]);

  const fetchClient = async () => {
    if (!businessId) return;
    try {
      const clientSnap = await getDocs(collection(db, "clients"));
      const clientDoc = clientSnap.docs.find(
        (docItem) => docItem.id === businessId
      );
      setClient(
        clientDoc
          ? ({ id: clientDoc.id, ...clientDoc.data() } as ClientData)
          : null
      );
    } catch (e) {
      console.error("Error fetching client:", e);
    }
  };

  const fetchAgreement = async () => {
    if (!businessId || !agreementNumber) return;
    try {
      const agreementsRef = collection(db, "clients", businessId, "agreements");
      const q = query(
        agreementsRef,
        where("agreementNumber", "==", parseInt(agreementNumber, 10)),
        limit(1)
      );
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const agDoc = qSnap.docs[0];
        setAgreement({ id: agDoc.id, ...agDoc.data() } as AgreementData);
      } else {
        setAgreement(null);
      }
    } catch (e) {
      console.error("Error fetching agreement:", e);
    }
  };

  const fetchPayments = async () => {
    if (!agreement) return;
    try {
      const paymentsRef = collection(
        db,
        "clients",
        businessId!,
        "agreements",
        agreement.id,
        "payments"
      );
      const pSnap = await getDocs(paymentsRef);
      const pData = pSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PaymentItem[];
      setPayments(pData);
    } catch (e) {
      console.error("Error fetching payments:", e);
    }
  };

  const handleAddPayment = async (paymentData: Omit<PaymentItem, "id">) => {
    if (!agreement) return;
    try {
      const paymentsRef = collection(
        db,
        "clients",
        businessId!,
        "agreements",
        agreement.id,
        "payments"
      );
      await addDoc(paymentsRef, {
        date: paymentData.date,
        amount: paymentData.amount,
        method: paymentData.method,
        note: paymentData.note,
      });
      fetchPayments();
    } catch (e) {
      console.error("Error adding payment:", e);
    }
  };

  const handleUpdatePayment = async (
    paymentId: string,
    paymentData: Partial<PaymentItem>
  ) => {
    if (!agreement) return;
    try {
      const paymentDoc = doc(
        db,
        "clients",
        businessId!,
        "agreements",
        agreement.id,
        "payments",
        paymentId
      );
      await updateDoc(paymentDoc, paymentData);
      fetchPayments();
    } catch (e) {
      console.error("Error updating payment:", e);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!agreement) return;
    try {
      await deleteDoc(
        doc(
          db,
          "clients",
          businessId!,
          "agreements",
          agreement.id,
          "payments",
          paymentId
        )
      );
      fetchPayments();
    } catch (e) {
      console.error("Error deleting payment:", e);
    }
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "date",
        headerName: "Date",
        width: 120,
        valueGetter: (params) => parseDate(params),
        valueFormatter: (params) => formatDate(params),
        sortComparator: dateSortComparator,
      },
      {
        field: "amount",
        headerName: "Payment",
        width: 100,
        valueFormatter: (params) => formatMoney(params),
      },
      {
        field: "method",
        headerName: "Method",
        width: 120,
      },
      {
        field: "note",
        headerName: "Note",
        flex: 1,
        sortable: false,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 90,
        renderCell: (params) => {
          const rowPayment = params.row as PaymentItem;
          return (
            <>
              <Tooltip title="Edit" placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setSelectedPayment(rowPayment);
                    setPaymentModalOpen(true);
                  }}
                >
                  <Create />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" placement="top">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeletePayment(rowPayment.id)}
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

  const handleSavePayment = (paymentData: {
    date: string;
    amount: string;
    method: string;
    note: string;
  }) => {
    if (selectedPayment) {
      // Updating existing payment
      handleUpdatePayment(selectedPayment.id, paymentData);
    } else {
      // Adding new payment
      handleAddPayment(paymentData);
    }
    setSelectedPayment(null);
  };

  return (
    <Box p={2}>
      <Typography variant="h5">
        {client ? client.name : "Client"} - Agreement #{agreementNumber}
      </Typography>

      <Box mt={2} mb={2} display="flex" gap={1} justifyContent="center">
        <IconButton color="primary" onClick={() => navigate("/")}>
          <Home />
        </IconButton>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/services/${businessId}`)}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedPayment(null); // Reset for new payment
            setPaymentModalOpen(true);
          }}
        >
          Add Payment
        </Button>
      </Box>

      <DataGrid
        rows={payments}
        columns={columns}
        pageSizeOptions={[5]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        getRowId={(row) => row.id}
        sx={{
          height: 500,
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

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleSavePayment}
        payment={selectedPayment || undefined}
      />
    </Box>
  );
}
