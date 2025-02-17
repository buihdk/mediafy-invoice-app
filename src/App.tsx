import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ServicesPage from "./pages/ServicesPage";
import PaymentsPage from "./pages/PaymentsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/services/:businessId" element={<ServicesPage />} />
      <Route
        path="/payments/:businessId/:agreementNumber"
        element={<PaymentsPage />}
      />
    </Routes>
  );
}

export default App;
