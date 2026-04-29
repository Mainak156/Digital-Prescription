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

      {/* ================= HEADER ================= */}
      <div className="bg-white shadow-md p-4 text-center">
        <h1 className="text-2xl font-bold text-blue-700">
          SmartRx AI
        </h1>
        <p className="text-sm text-gray-500">
          A Doctor-in-the-loop Digitalised Prescription Generator
        </p>
      </div>

      {/* ================= NAVBAR ================= */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow-sm">

        <button
          onClick={() => setActiveTab("prescription")}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            activeTab === "prescription"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Prescription
        </button>

        <button
          onClick={() => setActiveTab("hospital")}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            activeTab === "hospital"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Hospital Setup
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-6 max-w-6xl mx-auto">

        {activeTab === "hospital" && (
          <div className="animate-fadeIn">
            <HospitalConfig
              setHospital={(data) => {
                setHospital(data);
                localStorage.setItem("hospital", JSON.stringify(data));
              }}
            />
          </div>
        )}

        {activeTab === "prescription" && (
          <div className="animate-fadeIn">

            {!hospital ? (
              <div className="card text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  ⚠ Hospital Not Configured
                </h2>
                <p className="text-gray-600">
                  Please configure hospital details before creating prescriptions.
                </p>

                <button
                  onClick={() => setActiveTab("hospital")}
                  className="btn btn-blue mt-4"
                >
                  Go to Hospital Setup
                </button>
              </div>
            ) : (
              <PrescriptionForm hospital={hospital} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
