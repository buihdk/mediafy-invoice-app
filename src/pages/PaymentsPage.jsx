// src/pages/PaymentsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
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
} from "firebase/firestore";
import AddPaymentModal from "../components/AddPaymentModal";

export default function PaymentsPage() {
  const { businessId, agreementNumber } = useParams();
  const [client, setClient] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
      });
      fetchPayments();
    } catch (e) {
      console.error("Error adding payment:", e);
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
      { field: "date", headerName: "Date", width: 120 },
      { field: "amount", headerName: "Payment", width: 100 },
      { field: "method", headerName: "Method", width: 120 },
      {
        field: "actions",
        headerName: "Actions",
        width: 150,
        renderCell: (params) => {
          return (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeletePayment(params.row.id)}
            >
              Delete
            </Button>
          );
        },
      },
    ],
    [payments]
  );

  return (
    <Box p={2}>
      <Typography variant="h5">
        {client ? client.name : "Client"} - Agreement #{agreementNumber}
      </Typography>

      <Box mt={2} mb={2}>
        <Button variant="contained" onClick={() => setPaymentModalOpen(true)}>
          Add Payment
        </Button>
      </Box>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={payments}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id}
        />
      </div>

      <AddPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleAddPayment}
      />
    </Box>
  );
}
