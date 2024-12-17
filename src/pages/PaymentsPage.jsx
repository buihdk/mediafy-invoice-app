// src/pages/PaymentsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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
import { Create, Delete, ArrowBack } from "@mui/icons-material";

import { parseDate, dateSortComparator, formatDate } from "../helpers";
import PaymentModal from "../components/PaymentModal";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { businessId, agreementNumber } = useParams();
  const [client, setClient] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

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
    try {
      const clientSnap = await getDocs(collection(db, "clients"));
      const clientData = clientSnap.docs.find((doc) => doc.id === businessId);
      setClient(
        clientData ? { id: clientData.id, ...clientData.data() } : null
      );
    } catch (e) {
      console.error("Error fetching client:", e);
    }
  };

  const fetchAgreement = async () => {
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
        setAgreement({ id: agDoc.id, ...agDoc.data() });
      } else {
        setAgreement(null);
      }
    } catch (e) {
      console.error("Error fetching agreement:", e);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!agreement) return;
      const paymentsRef = collection(
        db,
        "clients",
        businessId,
        "agreements",
        agreement.id,
        "payments"
      );
      const pSnap = await getDocs(paymentsRef);
      const pData = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPayments(pData);
    } catch (e) {
      console.error("Error fetching payments:", e);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      const paymentsRef = collection(
        db,
        "clients",
        businessId,
        "agreements",
        agreement.id,
        "payments"
      );
      await addDoc(paymentsRef, {
        date: paymentData.date,
        amount: paymentData.amount,
        method: paymentData.method,
        note: paymentData.note || "",
      });
      fetchPayments();
    } catch (e) {
      console.error("Error adding payment:", e);
    }
  };

  const handleUpdatePayment = async (paymentId, paymentData) => {
    try {
      const paymentDoc = doc(
        db,
        "clients",
        businessId,
        "agreements",
        agreement.id,
        "payments",
        paymentId
      );
      await updateDoc(paymentDoc, {
        date: paymentData.date,
        amount: paymentData.amount,
        method: paymentData.method,
        note: paymentData.note || "",
      });
      fetchPayments();
    } catch (e) {
      console.error("Error updating payment:", e);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await deleteDoc(
        doc(
          db,
          "clients",
          businessId,
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

  const columns = useMemo(
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
        valueFormatter: (params) => `$${params || 0}`,
      },
      { field: "method", headerName: "Method", width: 120 },
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
          const rowPayment = params.row;
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
    [payments]
  );

  // Decide how to handle saving the payment (add or update)
  const handleSavePayment = (paymentData) => {
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
        height="100%"
        rows={payments}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row.id}
        sx={{
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f0fbfe",
          },
        }}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleSavePayment}
        payment={selectedPayment} // If not null, we are updating
      />
    </Box>
  );
}
