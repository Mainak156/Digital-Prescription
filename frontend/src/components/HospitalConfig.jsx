import { useState } from "react";
import { createHospital } from "../services/api";

function HospitalConfig({ setHospital }) {
  const [hospital, setLocalHospital] = useState({
    name: "",
    logo_url: "",   // preview
    logo_file: null, // actual file
    address: "",
    contact: ""
  });

  const [loading, setLoading] = useState(false);

  // ✅ Handle text input
  const handleChange = (e) => {
    setLocalHospital({
      ...hospital,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLocalHospital({
      ...hospital,
      logo_file: file,
      logo_url: URL.createObjectURL(file)
    });
  };

  // ✅ Save hospital (FINAL FIXED)
  const handleSave = async () => {
    try {
      if (!hospital.name || !hospital.address || !hospital.contact) {
        alert("Please fill all fields");
        return;
      }

      if (!hospital.logo_file) {
        alert("Please upload a hospital logo");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("name", hospital.name);
      formData.append("address", hospital.address);
      formData.append("contact", hospital.contact);
      formData.append("logo", hospital.logo_file);

      const res = await createHospital(formData);

      console.log("🔥 FULL RESPONSE:", res);

      const responseData = res?.data;

      if (!responseData || responseData.error) {
        throw new Error(responseData?.error || "Failed to save hospital");
      }

      const saved = Array.isArray(responseData.data)
        ? responseData.data[0]
        : responseData.data;

      if (!saved || !saved.id) {
        throw new Error("❌ Hospital ID not returned from backend");
      }

      // 🔥 CRITICAL LINE
      setHospital(saved);

      console.log("✅ SAVED HOSPITAL:", saved);

      alert("Hospital saved successfully ✅");

    } catch (err) {
      console.error("ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">

      <h2 className="text-2xl font-bold mb-4 text-center">
        Hospital Configuration
      </h2>

      <input
        name="name"
        placeholder="Hospital Name"
        className="input"
        onChange={handleChange}
      />

      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">
          Hospital Logo
        </label>

        <input
          type="file"
          accept="image/*"
          className="input"
          onChange={handleLogoUpload}
        />

        {hospital.logo_url && (
          <img
            src={hospital.logo_url}
            alt="Hospital Logo"
            className="mt-3 h-20 object-contain border rounded shadow"
          />
        )}
      </div>

      <input
        name="address"
        placeholder="Hospital Address"
        className="input mt-3"
        onChange={handleChange}
      />

      <input
        name="contact"
        placeholder="Contact Number"
        className="input mt-3"
        onChange={handleChange}
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn btn-green w-full mt-4"
      >
        {loading ? "Saving..." : "Save Hospital"}
      </button>

    </div>
  );
}

export default HospitalConfig;