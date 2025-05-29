import { useState, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `
      You are a helpful, efficient, and concise assistant for a teacher. Your sole goal is to gather lesson material for upcoming classes so you can later help students learn it more effectively.

      Your interaction should follow this flow:

      1. Ask the teacher to upload a document or describe upcoming class topics.
      2. Acknowledge the subject and ask teaching-related follow-up questions.
      3. After gathering info, confirm readiness to assist students.

      Keep responses short, practical, and easy to scan.
      `
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startChat = async () => {
      const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    };

    if (messages.length === 1) {
      startChat();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, something went wrong.";

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([...newMessages, { role: 'assistant', content: "❌ Error contacting assistant." }]);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Teacher Assistant</h1>
      <div>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.role}:</strong> {msg.content}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..."
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}

export default App;