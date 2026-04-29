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
        custom_fields: {}
    });

    const [customInputs, setCustomInputs] = useState([{ key: "", value: "" }]);

    const [stage, setStage] = useState("create");
    const [loading, setLoading] = useState(false);

    const [prescriptionId, setPrescriptionId] = useState(null);
    const [finalText, setFinalText] = useState("");

    // ================= HANDLERS =================

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

    // ================= CREATE =================

    const handleCreate = async () => {
        try {
            if (!hospital?.id) return alert("Configure hospital first");

            if (!form.patient_name || !form.age || !form.sex || !form.doctor_name || !form.diagnosis) {
                return alert("Please fill all required fields");
            }

            setLoading(true);

            const payload = {
                ...form,
                hospital_id: hospital.id,
                age: parseInt(form.age),
                weight: form.weight ? parseFloat(form.weight) : null,
                custom_fields: prepareCustomFields()
            };

            const res = await createPrescription(payload);

            const data = res?.data?.[0] || res?.data || res;

            if (!data?.id) throw new Error("Invalid backend response");

            setPrescriptionId(data.id);
            setStage("created");

        } catch (err) {
            console.error("CREATE ERROR:", err);
            alert(err?.error || err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ================= GENERATE AI =================

    const handleGenerate = async () => {
        try {
            setLoading(true);

            const res = await generateAI(prescriptionId);

            let aiText = res?.ai_text || res?.data?.ai_text;

            if (!aiText) throw new Error("AI response empty");

            if (typeof aiText === "object") {
                aiText = JSON.stringify(aiText, null, 2);
            }

            setFinalText(aiText);
            setStage("generated");

        } catch (err) {
            console.error(err);
            alert(err.message || "AI generation failed");
        } finally {
            setLoading(false);
        }
    };

    // ================= PUBLISH =================

    const handlePublish = async () => {
        try {
            setLoading(true);
            await publishPrescription(prescriptionId);
            setStage("published");
        } catch (err) {
            console.error(err);
            alert("Publish failed");
        } finally {
            setLoading(false);
        }
    };

    // ================= PDF =================

    const downloadPDF = async () => {
        try {
            const doc = new jsPDF();
            let y = 40;

            // ================= IMAGE HELPER =================
            const getBase64FromUrl = async (url) => {
                try {
                    const res = await fetch(url);
                    const blob = await res.blob();

                    return await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn("Logo load failed:", err);
                    return null;
                }
            };

            const getFullLogoUrl = (url) => {
                if (!url) return null;
                if (url.startsWith("http")) return url;
                return `${import.meta.env.VITE_API_URL}${url}`;
            };

            // ================= HEADER =================
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, 210, 30, "F");

            doc.setTextColor(255);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(16);
            doc.text(hospital?.name || "Hospital", 10, 15);

            doc.setFontSize(10);
            doc.text(hospital?.address || "", 10, 22);
            doc.text(hospital?.contact || "", 10, 27);

            // ================= LOGO (TOP RIGHT) =================
            if (hospital?.logo_url) {
                const logoUrl = getFullLogoUrl(hospital.logo_url);
                const base64Logo = await getBase64FromUrl(logoUrl);

                if (base64Logo) {
                    try {
                        const format = base64Logo.includes("image/png") ? "PNG" : "JPEG";

                        // White box behind logo
                        doc.setGState(new doc.GState({opacity: 0.5}));
                        doc.setFillColor(255, 255, 255);
                        doc.rect(155, 4, 50, 22, "F");

                        // Logo
                        doc.addImage(base64Logo, format, 160, 5, 40, 20);
                    } catch (err) {
                        console.warn("Logo render failed:", err);
                    }
                }
            }

            doc.setTextColor(0);

            // ================= DATE =================
            const today = new Date().toLocaleDateString();
            doc.text(`Date: ${today}`, 150, 38);

            // ================= PATIENT BOX =================
            doc.rect(10, y, 190, 30);
            doc.line(105, y, 105, y + 30);

            doc.text(`Patient: ${form.patient_name}`, 12, y + 8);
            doc.text(`Age/Sex: ${form.age} / ${form.sex}`, 12, y + 16);
            doc.text(`Weight: ${form.weight || "N/A"} kg`, 12, y + 24);

            doc.text(`Doctor: ${form.doctor_name}`, 110, y + 8);
            doc.text(`Reg No: ${form.doctor_registration || "N/A"}`, 110, y + 16);

            y += 40;

            // ================= DIAGNOSIS =================
            doc.setFont("Helvetica", "bold");
            doc.text("Diagnosis:", 10, y);
            y += 6;

            doc.setFont("Helvetica", "normal");
            const diagnosisLines = doc.splitTextToSize(form.diagnosis || "-", 180);
            doc.text(diagnosisLines, 10, y);
            y += diagnosisLines.length * 6 + 5;

            // ================= RX =================
            doc.setFont("Times", "bolditalic");
            doc.setFontSize(26);
            doc.text("℞", 10, y);
            y += 10;

            // ================= SAFE AI PARSE =================
            let parsedAI = {};
            try {
                parsedAI = JSON.parse(finalText);
            } catch { }

            const meds = Array.isArray(parsedAI?.medications) ? parsedAI.medications : [];
            const directions = typeof parsedAI?.directions === "object" ? parsedAI.directions : {};

            // ================= MEDICATIONS =================
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Medications:", 10, y);
            y += 6;

            doc.setFont("Helvetica", "normal");

            meds.forEach((m, i) => {
                const line = `${i + 1}. ${m.name || ""} ${m.strength || ""} ${m.form || ""} (${m.quantity || ""})`;
                const wrapped = doc.splitTextToSize(line, 180);
                doc.text(wrapped, 15, y);
                y += wrapped.length * 6;
            });

            y += 5;

            // ================= DIRECTIONS =================
            doc.setFont("Helvetica", "bold");
            doc.text("Directions:", 10, y);
            y += 6;

            doc.setFont("Helvetica", "normal");

            Object.entries(directions).forEach(([k, v]) => {
                const wrapped = doc.splitTextToSize(`${k}: ${v}`, 180);
                doc.text(wrapped, 12, y);
                y += wrapped.length * 6;
            });

            // ================= SIGNATURE =================
            y += 20;

            doc.line(130, y, 190, y);

            doc.setFont("Times", "italic");
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 120);
            doc.text(form.doctor_name || "Dr. Name", 132, y - 3);

            doc.setFont("Helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text("Doctor Signature", 132, y + 5);

            doc.setFontSize(9);
            doc.text(`Reg No: ${form.doctor_registration || "N/A"}`, 132, y + 10);

            // ================= SAVE =================
            doc.save(`${form.patient_name}-prescription.pdf`);

        } catch (err) {
            console.error("PDF ERROR:", err);
            alert("PDF generation failed");
        }
    };

    // ================= UI =================

    return (
        <div className="p-6 flex justify-center">

            {stage === "create" && (
                <div className="card w-full max-w-5xl">
                    <h1 className="page-title">Prescription Generator</h1>

                    <h2 className="section-title">Patient Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="patient_name" className="input" placeholder="Name" onChange={handleChange} />
                        <input name="address" className="input" placeholder="Address" onChange={handleChange} />
                        <input name="age" type="number" className="input" placeholder="Age" onChange={handleChange} />
                        <input name="sex" className="input" placeholder="Sex" onChange={handleChange} />
                        <input name="weight" type="number" className="input" placeholder="Weight" onChange={handleChange} />
                    </div>

                    <h2 className="section-title mt-6">Doctor Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="doctor_name" className="input" placeholder="Doctor Name" onChange={handleChange} />
                        <input name="doctor_registration" className="input" placeholder="Registration" onChange={handleChange} />
                        <input name="doctor_contact" className="input" placeholder="Contact" onChange={handleChange} />
                    </div>

                    <h2 className="section-title mt-6">Diagnosis</h2>
                    <input name="diagnosis" className="input" placeholder="Diagnosis..." onChange={handleChange} />

                    <h3 className="mt-4 font-semibold">Additional Notes</h3>
                    {customInputs.map((item, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3 mt-2">
                            <input className="input" placeholder="Field Name"
                                onChange={(e) => handleCustomChange(i, "key", e.target.value)} />
                            <input className="input" placeholder="Value"
                                onChange={(e) => handleCustomChange(i, "value", e.target.value)} />
                        </div>
                    ))}

                    <button onClick={addCustomField} className="btn btn-blue mt-2">
                        + Add Field
                    </button>

                    <button onClick={handleCreate} className="btn btn-blue mt-6 w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save & Continue"}
                    </button>
                </div>
            )}

            {stage === "created" && (
                <div className="text-center">
                    <h2 className="text-xl text-green-700">Step 1 Complete</h2>
                    <button onClick={handleGenerate} className="btn btn-green mt-4" disabled={loading}>
                        {loading ? "Generating..." : "Generate AI Prescription"}
                    </button>
                </div>
            )}

            {stage === "generated" && (
                <div className="w-full max-w-3xl">
                    <h2 className="section-title">AI Prescription</h2>
                    <pre className="ai-output whitespace-pre-wrap">{finalText}</pre>
                    <button onClick={() => setStage("reviewed")} className="btn btn-blue mt-3">
                        Approve Prescription
                    </button>
                </div>
            )}

            {stage === "reviewed" && (
                <div className="text-center">
                    <button onClick={handlePublish} className="btn btn-purple" disabled={loading}>
                        {loading ? "Publishing..." : "Publish Prescription"}
                    </button>
                </div>
            )}

            {stage === "published" && (
                <div className="text-center">
                    <button onClick={downloadPDF} className="btn btn-green">
                        Download PDF
                    </button>
                </div>
            )}
        </div>
    );
}

export default PrescriptionForm;
