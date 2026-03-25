import { useState } from "react";
import jsPDF from "jspdf";
import {
    createPrescription,
    generateAI,
    publishPrescription
} from "../services/api";

function PrescriptionForm({ hospital }) {

    const [form, setForm] = useState({
        patient_name: "",
        address: "",
        age: "",
        sex: "",
        weight: "",
        doctor_name: "",
        doctor_registration: "",
        doctor_contact: "",
        diagnosis: "",
        medications: [{ name: "", strength: "", form: "", quantity: "" }],
        directions: { dose: "", frequency: "", route: "", duration: "", purpose: "" },
        refill_info: "",
        controlled_substance: false,
        custom_fields: {}
    });

    const [customInputs, setCustomInputs] = useState([{ key: "", value: "" }]);

    const [stage, setStage] = useState("create");
    const [prescriptionId, setPrescriptionId] = useState(null);
    const [finalText, setFinalText] = useState("");
    const [meta, setMeta] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleDirections = (e) => {
        setForm({
            ...form,
            directions: {
                ...form.directions,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleMedicationChange = (index, e) => {
        const meds = [...form.medications];
        meds[index][e.target.name] = e.target.value;
        setForm({ ...form, medications: meds });
    };

    const addMedication = () => {
        setForm({
            ...form,
            medications: [
                ...form.medications,
                { name: "", strength: "", form: "", quantity: "" }
            ]
        });
    };

    const handleCustomChange = (index, field, value) => {
        const updated = [...customInputs];
        updated[index][field] = value;
        setCustomInputs(updated);
    };

    const addCustomField = () => {
        setCustomInputs([...customInputs, { key: "", value: "" }]);
    };

    const prepareCustomFields = () => {
        const obj = {};
        customInputs.forEach((item) => {
            if (item.key && item.value) obj[item.key] = item.value;
        });
        return obj;
    };

    const handleCreate = async () => {
        try {
            if (!hospital?.id) {
                alert("Please configure hospital first");
                return;
            }
            console.log("🚨 HOSPITAL OBJECT:", hospital);

            const payload = {
                ...form,
                hospital_id: hospital.id,
                custom_fields: prepareCustomFields()
            };

            const res = await createPrescription(payload);
            const responseData = res.data;

            console.log("PRESCRIPTION RESPONSE:", responseData);

            if (!responseData || responseData.error) {
                throw new Error(responseData?.error || "Failed to create prescription");
            }

            const data = Array.isArray(responseData.data)
                ? responseData.data[0]
                : responseData.data;

            if (!data || !data.id) {
                throw new Error("Invalid response from backend");
            }

            setPrescriptionId(data.id);
            setStage("created");

        } catch (err) {
            console.error("CREATE ERROR:", err);
            alert(err.message);
        }
    };

    const handleGenerate = async () => {
        const res = await generateAI(prescriptionId);
        setFinalText(res.data.ai_text);
        setStage("generated");
    };

    const handlePublish = async () => {
        await publishPrescription(prescriptionId);
        setStage("published");
    };

    const downloadPDF = async () => {
        const doc = new jsPDF();

        // 🔁 Helper: Convert image to base64 safely
        const getBase64FromUrl = async (url) => {
            try {
                const res = await fetch(url, { mode: "cors" });
                const blob = await res.blob();

                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.error("Base64 conversion failed:", err);
                return null;
            }
        };

        let y = 40;

        // 🔵 HEADER
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 30, "F");

        doc.setTextColor(255, 255, 255);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text(hospital?.name || "Hospital Name", 10, 15);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(hospital?.address || "", 10, 22);
        doc.text(hospital?.contact || "", 10, 27);

        // 🖼️ LOGO (Robust)
        if (hospital?.logo_url) {
            const base64Logo = await getBase64FromUrl(hospital.logo_url);

            if (base64Logo) {
                try {
                    const format = base64Logo.includes("image/png") ? "PNG" : "JPEG";

                    doc.setFillColor(255, 255, 255);
                    doc.rect(155, 4, 50, 22, "F");

                    doc.addImage(base64Logo, format, 160, 5, 40, 20);
                } catch (err) {
                    console.error("Logo render failed:", err);
                }
            }
        }

        // 📅 DATE
        const today = new Date().toLocaleDateString();
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`Date: ${today}`, 150, 38);

        // 🔲 PATIENT BOX
        doc.setDrawColor(180);
        doc.rect(10, y, 190, 30);
        doc.line(105, y, 105, y + 30);

        doc.setFontSize(11);

        doc.text(`Patient: ${form.patient_name}`, 12, y + 8);
        doc.text(`Age/Sex: ${form.age} / ${form.sex}`, 12, y + 16);
        doc.text(`Weight: ${form.weight || "N/A"} kg`, 12, y + 24);

        doc.text(`Doctor: ${form.doctor_name}`, 110, y + 8);
        doc.text(`Reg No: ${form.doctor_registration || "N/A"}`, 110, y + 16);

        y += 40;

        // 🔍 DIAGNOSIS
        doc.setFont("Helvetica", "bold");
        doc.text("Diagnosis:", 10, y);
        y += 6;

        doc.setFont("Helvetica", "normal");
        const diagnosisLines = doc.splitTextToSize(form.diagnosis || "-", 180);
        doc.text(diagnosisLines, 10, y);
        y += diagnosisLines.length * 6 + 5;

        // 💊 RX SYMBOL
        doc.setFont("Times", "bolditalic");
        doc.setFontSize(26);
        doc.text("℞", 10, y);
        y += 10;

        // 💊 MEDICATIONS
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Medications:", 10, y);
        y += 6;

        doc.setFont("Helvetica", "normal");

        form.medications.forEach((m, i) => {
            const line = `${i + 1}. ${m.name} ${m.strength} ${m.form} (${m.quantity})`;
            const wrapped = doc.splitTextToSize(line, 180);
            doc.text(wrapped, 15, y);
            y += wrapped.length * 6;
        });

        y += 5;

        // 📋 DIRECTIONS
        doc.setFont("Helvetica", "bold");
        doc.text("Directions:", 10, y);
        y += 6;

        doc.setFont("Helvetica", "normal");

        Object.entries(form.directions).forEach(([k, v]) => {
            if (v) {
                const wrapped = doc.splitTextToSize(`${k}: ${v}`, 180);
                doc.text(wrapped, 12, y);
                y += wrapped.length * 6;
            }
        });

        y += 5;

        // 📝 ADDITIONAL NOTES
        const custom = prepareCustomFields();
        if (Object.keys(custom).length > 0) {
            doc.setFont("Helvetica", "bold");
            doc.text("Additional Notes:", 10, y);
            y += 6;

            doc.setFont("Helvetica", "normal");

            Object.entries(custom).forEach(([k, v]) => {
                const wrapped = doc.splitTextToSize(`${k}: ${v}`, 180);
                doc.text(wrapped, 12, y);
                y += wrapped.length * 6;
            });
        }

        // ✍️ SIGNATURE
        y += 20;

        doc.setDrawColor(0);
        doc.line(130, y, 190, y);

        doc.setFont("Times", "italic");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 150);
        doc.text(form.doctor_name || "Dr. Name", 132, y - 3);

        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`/s/ ${form.doctor_name}`, 132, y - 10);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text("Doctor Signature", 132, y + 5);

        doc.setFontSize(9);
        doc.text(`Reg No: ${form.doctor_registration || "N/A"}`, 132, y + 10);

        // 🩺 WATERMARK (LAST so it stays faint)
        doc.setTextColor(230);
        doc.setFontSize(70);
        doc.text(hospital?.name || "Hospital", 30, 200, { angle: 45 });

        // 💾 SAVE
        doc.save(`${form.patient_name}-${prescriptionId}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex justify-center">

            {stage === "create" && (
                <div className="card w-full max-w-5xl">

                    {hospital && (
                        <div className="text-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold">{hospital.name}</h2>
                            <p className="text-sm">{hospital.address}</p>
                            <p className="text-sm">{hospital.contact}</p>

                            {hospital.logo_url && (
                                <img
                                    src={
                                        hospital?.logo_url?.startsWith("http")
                                            ? hospital.logo_url
                                            : `${import.meta.env.VITE_API_URL}${hospital.logo_url}`
                                    }
                                    alt="Hospital Logo"
                                    className="mt-3 h-16 object-contain border rounded mx-auto"
                                />
                            )}
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-center mb-6">
                        Digital Prescription
                    </h1>

                    <h2 className="section-title">Patient Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="patient_name" placeholder="Name" className="input" onChange={handleChange} />
                        <input name="address" placeholder="Address" className="input" onChange={handleChange} />
                        <input name="age" placeholder="Age" className="input" onChange={handleChange} />
                        <input name="sex" placeholder="Sex" className="input" onChange={handleChange} />
                        <input name="weight" placeholder="Weight" className="input" onChange={handleChange} />
                    </div>

                    <h2 className="section-title mt-6">Doctor Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="doctor_name" placeholder="Doctor Name" className="input" onChange={handleChange} />
                        <input name="doctor_registration" placeholder="Registration" className="input" onChange={handleChange} />
                        <input name="doctor_contact" placeholder="Contact" className="input" onChange={handleChange} />
                    </div>

                    <h2 className="section-title mt-6">Diagnosis</h2>
                    <input name="diagnosis" placeholder="Diagnosis" className="input" onChange={handleChange} />

                    <h2 className="section-title mt-6">Medications</h2>
                    {form.medications.map((med, i) => (
                        <div key={i} className="grid grid-cols-4 gap-3 mb-2">
                            <input name="name" placeholder="Drug" className="input" onChange={(e) => handleMedicationChange(i, e)} />
                            <input name="strength" placeholder="Strength" className="input" onChange={(e) => handleMedicationChange(i, e)} />
                            <input name="form" placeholder="Form" className="input" onChange={(e) => handleMedicationChange(i, e)} />
                            <input name="quantity" placeholder="Quantity" className="input" onChange={(e) => handleMedicationChange(i, e)} />
                        </div>
                    ))}
                    <button onClick={addMedication} className="btn btn-blue">+ Add Medication</button>

                    <h2 className="section-title mt-6">Directions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="dose" placeholder="Dose" className="input" onChange={handleDirections} />
                        <input name="frequency" placeholder="Frequency" className="input" onChange={handleDirections} />
                        <input name="route" placeholder="Route" className="input" onChange={handleDirections} />
                        <input name="duration" placeholder="Duration" className="input" onChange={handleDirections} />
                        <input name="purpose" placeholder="Purpose" className="input col-span-2" onChange={handleDirections} />
                    </div>

                    <h2 className="section-title mt-6">Additional</h2>
                    <input name="refill_info" placeholder="Refill Info" className="input" onChange={handleChange} />

                    <label className="flex items-center gap-2 mt-3">
                        <input type="checkbox" name="controlled_substance" onChange={handleChange} />
                        Controlled Substance
                    </label>

                    <h3 className="mt-4 font-semibold">Custom Fields</h3>
                    {customInputs.map((item, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3 mt-2">
                            <input placeholder="Field Name" className="input"
                                onChange={(e) => handleCustomChange(i, "key", e.target.value)} />
                            <input placeholder="Value" className="input"
                                onChange={(e) => handleCustomChange(i, "value", e.target.value)} />
                        </div>
                    ))}
                    <button onClick={addCustomField} className="btn btn-blue mt-2">
                        + Add Custom Field
                    </button>

                    <button onClick={handleCreate} className="btn btn-blue mt-6 w-full">
                        Create Prescription
                    </button>

                </div>
            )}

            {stage === "created" && (
                <div className="text-center">
                    <h2 className="text-xl text-green-700">Data Saved</h2>
                    <button onClick={handleGenerate} className="btn btn-green mt-4">Generate Prescription</button>
                </div>
            )}

            {stage === "generated" && (
                <div className="w-full max-w-3xl">
                    <textarea
                        value={finalText}
                        onChange={(e) => setFinalText(e.target.value)}
                        className="w-full h-64 p-3 border"
                    />
                    <button onClick={() => setStage("reviewed")} className="btn btn-blue mt-3">
                        Save Prescription
                    </button>
                </div>
            )}

            {stage === "reviewed" && (
                <div className="text-center">
                    <button onClick={handlePublish} className="btn btn-purple">
                        Publish Prescription
                    </button>
                </div>
            )}

            {stage === "published" && (
                <div className="text-center">
                    <button onClick={downloadPDF} className="btn btn-green">
                        Download Prescription
                    </button>
                </div>
            )}

        </div>
    );
}

export default PrescriptionForm;