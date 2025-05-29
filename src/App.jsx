import { useState } from 'react';

function App() {
  const [lessonText, setLessonText] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('https://your-backend.com/set-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lessonText })
    });
    const data = await res.json();
    setResponse("Classroom link created! Share: /student.html?id=12345");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Teacher Lesson Uploader</h1>
      <textarea
        className="w-full h-40 mt-2 p-2 border"
        placeholder="Paste lesson content here..."
        value={lessonText}
        onChange={(e) => setLessonText(e.target.value)}
      />
      <button className="mt-2 bg-blue-500 text-white px-4 py-2" onClick={handleSubmit}>
        Submit
      </button>
      {response && <p className="mt-4 text-green-700">{response}</p>}
    </div>
  );
}

export default App;