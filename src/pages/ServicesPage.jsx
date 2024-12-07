// src/pages/ServicesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { db } from "../firebase";
import { collection, getDocs, addDoc, doc } from "firebase/firestore";
import AddAgreementModal from "../components/AddAgreementModal";

export default function ServicesPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchClientAndAgreements();
  }, [businessId]);

  const fetchClientAndAgreements = async () => {
    try {
      const agreementsRef = collection(db, "clients", businessId, "agreements");
      const querySnapshot = await getDocs(agreementsRef);
      const agData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // We might want to fetch the client name as well
      // This is optional if you only want to show the name. If needed:
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
      setAddModalOpen(false);
      fetchClientAndAgreements();
    } catch (e) {
      console.error("Error adding agreement:", e);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "payments",
        headerName: "Payments",
        width: 100,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              navigate(`/payments/${businessId}/${params.row.agreementNumber}`)
            }
          >
            Payments
          </Button>
        ),
      },
      { field: "agreementNumber", headerName: "Agreement Number", width: 150 },
      { field: "serviceCode", headerName: "Service Code", width: 120 },
      { field: "ratePerYear", headerName: "Rate/Year", width: 100 },
      { field: "duration", headerName: "Duration (months)", width: 150 },
      { field: "startDate", headerName: "Start Date", width: 120 },
      { field: "endDate", headerName: "End Date", width: 120 },
      { field: "ratePerMonth", headerName: "Rate/Month", width: 120 },
    ],
    [agreements]
  );

  return (
    <Box p={2}>
      <Box mb={2}>
        <Typography variant="h5">
          {client ? client.name : "Client"} - Services
        </Typography>
      </Box>
      <Box mb={2}>
        <Button variant="contained" onClick={() => setAddModalOpen(true)}>
          Add Agreement
        </Button>
      </Box>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={agreements}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id}
        />
      </div>

      <AddAgreementModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddAgreement}
        nextAgreementNumber={
          agreements.length > 0
            ? Math.max(...agreements.map((a) => a.agreementNumber)) + 1
            : 1
        }
      />
    </Box>
  );
}
