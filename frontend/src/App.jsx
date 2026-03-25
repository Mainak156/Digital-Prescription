import { useState } from "react";
import PrescriptionForm from "./components/PrescriptionForm";
import HospitalConfig from "./components/HospitalConfig";

function App() {
  const [activeTab, setActiveTab] = useState("prescription");
  const [hospital, setHospital] = useState(() => {
    const saved = localStorage.getItem("hospital");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* 🔷 NAVBAR TABS */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow-md">
        <button
          onClick={() => setActiveTab("prescription")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === "prescription"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          Prescription
        </button>

        <button
          onClick={() => setActiveTab("hospital")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === "hospital"
              ? "bg-green-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          Hospital Setup
        </button>
      </div>

      {/* 🔷 TAB CONTENT */}
      <div className="p-6">
        {activeTab === "hospital" && (
          <HospitalConfig setHospital={setHospital} />
        )}

        {activeTab === "prescription" && (
          <PrescriptionForm hospital={hospital} />
        )}
      </div>

    </div>
  );
}

export default App;