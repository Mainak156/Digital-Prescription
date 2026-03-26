function AIOutput({ text }) {
  if (!text) return null;

  // 🔥 Split into sections for better display
  const sections = text.split("\n\n");

  return (
    <div className="mt-6 p-6 bg-white shadow-lg rounded-xl border">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        AI Generated Prescription
      </h2>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border-b pb-2">
            <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
              {section}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIOutput;