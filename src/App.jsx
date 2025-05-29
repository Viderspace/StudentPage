

import { useState } from 'react';

function App() {
  const [lessonText, setLessonText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!lessonText.trim()) {
      setStatusMessage("Please enter some lesson content.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://your-backend.com/set-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: lessonText })
      });

      if (!response.ok) throw new Error("Server error");

      const result = await response.json();
      setStatusMessage("✅ Lesson uploaded successfully! Share link: /student.html?id=12345");
    } catch (error) {
      setStatusMessage("❌ Failed to submit lesson. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">📘 AI Classroom: Teacher Interface</h1>

      <textarea
        className="w-full h-60 p-3 border border-gray-300 rounded mb-4 resize-none"
        placeholder="Paste your lesson content here..."
        value={lessonText}
        onChange={(e) => setLessonText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Submitting..." : "Submit Lesson"}
      </button>

      {statusMessage && (
        <div className="mt-4 text-sm text-gray-800 bg-gray-100 p-3 rounded">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default App;