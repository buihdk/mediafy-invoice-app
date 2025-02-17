import { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
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
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { serviceCodes } from "../helpers";
import { SelectChangeEvent } from "@mui/material";

interface AgreementData {
  serviceCode: string[];
  duration: string;
  startDate: Date | null;
  budgetPerMonth: string;
}

interface Agreement {
  agreementNumber: number;
  serviceCode?: string[];
  duration?: number;
  startDate?: string;
  endDate?: string;
  ratePerMonth?: string;
  budgetPerMonth?: number;
}

interface AgreementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Agreement) => void;
  // If editing an existing one, else undefined
  agreement?: Agreement;
  nextAgreementNumber: number;
}

export default function AgreementModal({
  open,
  onClose,
  onSave,
  agreement,
  nextAgreementNumber,
}: AgreementModalProps) {
  const isUpdate = Boolean(agreement);

  const [agreementData, setAgreementData] = useState<AgreementData>({
    serviceCode: [],
    duration: "",
    startDate: null,
    budgetPerMonth: "",
  });

  useEffect(() => {
    if (agreement) {
      let parsedDate: Date | null = null;
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
        budgetPerMonth: agreement.budgetPerMonth?.toString() || "",
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAgreementData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceCodeChange = (event: SelectChangeEvent<string[]>) => {
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
    const totalMonthly = selectedServices.reduce((sum, sc) => sum + sc.monthly, 0);
    const ratePerMonth = totalMonthly.toFixed(2);
    // End date = Start date + (duration - 1) months
    let endDate = "";
    const duration = parseInt(agreementData.duration, 10) || 1;
    if (agreementData.startDate) {
      const end = new Date(agreementData.startDate.getTime());
      end.setMonth(end.getMonth() + duration - 1);
      endDate = end.toLocaleDateString();
    }

    onSave({
      agreementNumber: isUpdate ? agreement!.agreementNumber : nextAgreementNumber,
      serviceCode: agreementData.serviceCode,
      duration: duration,
      startDate: agreementData.startDate
        ? agreementData.startDate.toLocaleDateString()
        : "",
      endDate: endDate,
      ratePerMonth: ratePerMonth,
      budgetPerMonth: parseFloat(agreementData.budgetPerMonth) || 0,
    });
    onClose();
  };

  // Sort the serviceCodes alphabetically by label
  const sortedServiceCodes = [...serviceCodes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {isUpdate ? "Update Agreement" : "New Agreement"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <Box sx={{ display: "flex", gap: 2, marginTop: "10px" }}>
          <TextField
            fullWidth
            label="Agreement Number"
            value={isUpdate ? agreement!.agreementNumber : nextAgreementNumber}
            InputProps={{ readOnly: true }}
          />
          <DatePicker
            label="Start Date"
            value={agreementData.startDate}
            onChange={(newValue) =>
              setAgreementData((prev) => ({ ...prev, startDate: newValue }))
            }
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Custom/Month"
            name="budgetPerMonth"
            value={agreementData.budgetPerMonth}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
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
        </Box>
        <FormControl>
          <InputLabel>Service Code</InputLabel>
          <Select
            multiple
            label="Service Code"
            name="serviceCode"
            value={agreementData.serviceCode}
            onChange={handleServiceCodeChange}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => {
                  const service = sortedServiceCodes.find(
                    (sc) => sc.id === value
                  );
                  return service ? (
                    <Chip key={value} label={service.label} />
                  ) : null;
                })}
              </Box>
            )}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{isUpdate ? "Save" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
}