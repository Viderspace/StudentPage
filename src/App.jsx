import { useState, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `You are a helpful, efficient, and concise AI tutor. Your sole goal is to help the student 
      understand and learn the material provided by the teacher. You should adapt your teaching style to 
      fit the student's specific needs and preferences, which will be included in the context.
      
      Follow this flow:
      1. Understand the provided material (lesson plan, grade level, needs).
      2. Begin an interactive conversation with the student.
      3. Adapt teaching style (audio, written, short videos, etc.) based on student needs.
      4. Continue until key topics are understood.

      Be short, practical, and encouraging.`
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  //   const startChat = async () => {
  //     const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ messages })
  //     });
  //     const data = await res.json();
  //     setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
  //   };

  //   if (messages.length === 1) {
  //     startChat();
  //   }
  // }, []);
    const fetchLesson = async () => {
      const res = await fetch('https://teacher-backend-production.up.railway.app/lesson');
      const data = await res.json();
      const lessonContext = {
        role: 'system',
        content: `The following lesson plan has been provided by the teacher:\n\n${data.lesson}`
      };
      const starter = {
        role: 'user',
        content: `Hello, I'm ready to learn!`
      };

      setMessages((prev) => [...prev, lessonContext, starter]);

      const replyRes = await fetch('https://studentbackend-production.up.railway.app/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, lessonContext, starter] })
      });
      const replyData = await replyRes.json();

      setMessages((prev) => [...prev, { role: 'assistant', content: replyData.reply }]);
    };

    fetchLesson();
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
      <h1>Tutor</h1>
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