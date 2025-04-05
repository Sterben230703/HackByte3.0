import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import { WalletProvider } from "./components/WalletProvider";
import ContractManagement from "@/components/ContractManagement";
import DocumentCategories from "@/components/Category";
import SharedDocs from "@/components/SharedDocs";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ContractManagement />} />
          <Route path="/categorize" element={<DocumentCategories />} />
          <Route path="/shared-docs" element={<SharedDocs />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;