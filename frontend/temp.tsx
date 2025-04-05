import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./components/WalletSelector";
import ContractManagement from "@/components/ContractManagement";
import SigningDocument from "@/components/SigningDocument";
import ChatWithDocs from "@/components/ChatWithDocs";
import Categorize from "@/components/Categorize";
import SharedDocs from './components/SharedDocs';
import { Button } from "@/components/ui/button";
import { Menu, Trash2, Share2, FileText, FolderKanban, MessageSquareText } from "lucide-react";

function App() {
  const { connected, account } = useWallet();

  const shortenedAddress = account?.address
    ? account.address.slice(0, 6) + "..." + account.address.slice(-4)
    : "";

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] text-gray-800">
      {connected ? (
        <Router>
          {/* Sidebar */}
          {/* <aside className="w-60 min-h-screen bg-white shadow-md p-4 space-y-8 border-r border-gray-200">
            <div className="text-2xl font-extrabold text-blue-700 flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span>SAULT</span>
            </div>

            <nav className="space-y-4">
              <SidebarItem icon={<FileText size={18} />} label="Home" href="/" />
              <SidebarItem icon={<FolderKanban size={18} />} label="Categorized" href="/categorize" />
              <SidebarItem icon={<Share2 size={18} />} label="Shared" href="/shared-docs" />
              <SidebarItem icon={<Trash2 size={18} />} label="Trash" href="/trash" />
              <SidebarItem icon={<MessageSquareText size={18} />} label="Talk-2-Docs" href="/chatwithdocs" />
            </nav>

            <div className="absolute bottom-6 w-48">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Upload
              </Button>
            </div>
          </aside> */}

          {/* Main Content */}
          <div className="flex-grow p-6 relative">
            {/* <div className="flex justify-end">
              <div className="bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-full">
                {shortenedAddress}
              </div>
            </div> */}

            <Routes>
              <Route path="/" element={<ContractManagement />} />
              <Route path="/chatwithdocs" element={<ChatWithDocs />} />
              <Route path="/categorize" element={<Categorize />} />
              <Route path="/shared-docs" element={<SharedDocs />} />
              <Route path="/sign/:id" element={<SigningDocument />} />
            </Routes>
          </div>
        </Router>
      ) : (
        <div className="flex flex-col min-w-full items-center justify-center min-h-screen bg-white p-6 text-center">
          {/* Logo and Title */}
          <img src="/logo.png" alt="Logo" className="h-36 w-45 mb-4" />
          <h1 className="text-4xl font-bold text-blue-800 mb-6">Sault</h1>

          {/* Connect Wallet Card */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Connect Your Wallet</h2>
            <WalletSelector />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full max-w-4xl">
            {[
              { title: "Secure", desc: "Your documents are stored securely." },
              { title: "Vast Storage", desc: "Store a large number of documents." },
              { title: "Fast Retrieval", desc: "Quickly access your documents." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-bold text-blue-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SidebarItem = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <a
    href={href}
    className="flex items-center space-x-3 text-gray-700 hover:bg-blue-100 rounded-md px-3 py-2 transition"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

export default App;