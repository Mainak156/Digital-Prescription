function AIOutput({ text }) {
  if (!text) return null;

  return (
    <div className="mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">AI Generated Prescription</h2>
      <pre className="whitespace-pre-wrap text-sm text-gray-800">
        {text}
      </pre>
    </div>
  );
}

export default AIOutput;