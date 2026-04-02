import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import FloatingSaathi from "./components/FloatingSaathi";
import ToastContainer from "./components/ToastContainer";
import Landing from "./pages/Landing";
import BanksPage from "./pages/BanksPage";
import BankDetailPage from "./pages/BankDetailPage";
import StocksPage from "./pages/StocksPage";
import StockDetailPage from "./pages/StockDetailPage";
import InsurancePage from "./pages/InsurancePage";
import InsuranceDetailPage from "./pages/InsuranceDetailPage";
import FindAssetsPage from "./pages/FindAssetsPage";
import FindAssetsResults from "./pages/FindAssetsResults";
import WillWizard from "./pages/WillWizard";
import RecoveryPage from "./pages/RecoveryPage";
import ProfilePage from "./pages/ProfilePage";
import UnderDev from "./pages/UnderDev";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/find-assets" element={<FindAssetsPage />} />
        <Route path="/find-assets/results" element={<FindAssetsResults />} />
        <Route path="/assets/banks" element={<BanksPage />} />
        <Route path="/assets/banks/:bankSlug" element={<BankDetailPage />} />
        <Route path="/assets/stocks" element={<StocksPage />} />
        <Route path="/assets/stocks/:brokerSlug" element={<StockDetailPage />} />
        <Route path="/assets/insurance" element={<InsurancePage />} />
        <Route path="/assets/insurance/:insurerSlug" element={<InsuranceDetailPage />} />
        <Route path="/will-wizard" element={<WillWizard />} />
        <Route path="/recovery" element={<RecoveryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/legal-help" element={<UnderDev />} />
        <Route path="/privacy" element={<UnderDev />} />
        <Route path="/terms" element={<UnderDev />} />
        <Route path="*" element={<UnderDev />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
        <FloatingSaathi />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
