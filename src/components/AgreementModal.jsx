import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import { serviceCodes } from "../helpers";

export default function AgreementModal({
  open,
  onClose,
  onSave,
  agreement,
  nextAgreementNumber,
}) {
  const isUpdate = Boolean(agreement);

  const [agreementData, setAgreementData] = useState({
    serviceCode: [],
    duration: "",
    startDate: null,
    budgetPerMonth: "",
  });

  useEffect(() => {
    if (agreement) {
      let parsedDate = null;
      if (agreement.startDate) {
        const parts = agreement.startDate.split("/");
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          const d = new Date(year, month, day);
          if (!isNaN(d.getTime())) {
            parsedDate = d;
          }
        }
      }

      setAgreementData({
        serviceCode: Array.isArray(agreement.serviceCode)
          ? agreement.serviceCode
          : [],
        duration: agreement.duration?.toString() || "",
        startDate: parsedDate,
        budgetPerMonth: agreement.budgetPerMonth || "",
      });
    } else {
      setAgreementData({
        serviceCode: [],
        duration: "",
        startDate: null,
        budgetPerMonth: "",
      });
    }
  }, [agreement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgreementData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceCodeChange = (event) => {
    const { value } = event.target;
    setAgreementData((prev) => ({
      ...prev,
      serviceCode: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSave = () => {
    // Calculate Rate/Month as sum of selected services
    const selectedServices = serviceCodes.filter((sc) =>
      agreementData.serviceCode.includes(sc.id)
    );
    const totalMonthly = selectedServices.reduce(
      (sum, sc) => sum + sc.monthly,
      0
    );
    const ratePerMonth = totalMonthly.toFixed(2);

    // Rate per Year = ratePerMonth * 12
    const ratePerYear = (parseFloat(ratePerMonth) * 12).toFixed(2);

    // End date = Start date + (duration - 1) months
    let endDate = "";
    const duration = parseInt(agreementData.duration, 10) || 1;
    if (agreementData.startDate) {
      const end = new Date(agreementData.startDate.getTime());
      end.setMonth(end.getMonth() + duration - 1);
      endDate = end.toLocaleDateString();
    }

    onSave({
      agreementNumber: isUpdate
        ? agreement.agreementNumber
        : nextAgreementNumber,
      serviceCode: agreementData.serviceCode,
      duration: duration,
      startDate: agreementData.startDate
        ? agreementData.startDate.toLocaleDateString()
        : "",
      endDate: endDate,
      ratePerMonth: ratePerMonth,
      ratePerYear: ratePerYear,
      budgetPerMonth: parseFloat(agreementData.budgetPerMonth) || 0,
    });
    onClose();
  };

  // Sort the serviceCodes alphabetically by label
  const sortedServiceCodes = [...serviceCodes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isUpdate ? "Update Agreement" : "New Agreement"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          sx={{ marginTop: "10px" }}
          label="Agreement Number"
          value={isUpdate ? agreement.agreementNumber : nextAgreementNumber}
          InputProps={{ readOnly: true }}
        />

        <FormControl>
          <InputLabel>Service Code</InputLabel>
          <Select
            multiple
            name="serviceCode"
            value={agreementData.serviceCode}
            onChange={handleServiceCodeChange}
            renderValue={(selected) => {
              const selectedObjs = sortedServiceCodes.filter((sc) =>
                selected.includes(sc.id)
              );
              return selectedObjs.map((o) => o.code).join(", ");
            }}
          >
            {sortedServiceCodes.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                <Checkbox
                  checked={agreementData.serviceCode.indexOf(service.id) > -1}
                />
                <ListItemText primary={`${service.label}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="Budget/Month"
          name="budgetPerMonth"
          value={agreementData.budgetPerMonth}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
        <TextField
          type="number"
          label="Duration"
          name="duration"
          value={agreementData.duration}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">months</InputAdornment>
            ),
          }}
        />
        <DatePicker
          label="Start Date"
          value={agreementData.startDate}
          onChange={(newValue) =>
            setAgreementData((prev) => ({ ...prev, startDate: newValue }))
          }
          renderInput={(params) => <TextField {...params} />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{isUpdate ? "Save" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
}
