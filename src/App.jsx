
import { useState, useEffect } from 'react';




function App() {
  const [messages, setMessages] = useState([
    { role: "system", 
  content: `
  You are a helpful, efficient, and concise assistant for a teacher. Your sole goal is to gather lesson material for upcoming classes so you can later help students learn it more effectively.

  Your interaction should follow this flow:
  
  1. **Start** by asking the teacher to upload a document containing the material, or alternatively to describe the upcoming class topics in their own words.
  
  2. Once you receive the material or topic:
     - Briefly acknowledge the subject.
     - Ask teaching-related follow-up questions, such as:
       - What teaching methods they prefer (lecture, examples, discussion, etc.)
       - Whether there are specific examples or exercises they use in class
       - Any special needs or goals for the students
  
  3. After collecting all information:
     - Confirm that you're ready to support the students with personalized explanations and tutoring based on the material.
  
  Keep all responses **short, practical, and easy to scan** — avoid long explanations unless asked.
  
  If the teacher seems unsure, gently guide them by suggesting helpful options.
` 
},
    // { role: 'assistant', content: 'Hello! What would you like to plan today for class?' }
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
      setMessages([...messages, { role: 'assistant', content: data.reply }]);
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

const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ messages: newMessages })
});

const data = await res.json();
const reply = data.reply || "Sorry, something went wrong.";

    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setLoading(false);
  };


  const newMessages = [...messages, hiddenMessage, userVisibleMessage];
  
  // 👇 Only show the visible user message in the chat UI
  setMessages([...messages, userVisibleMessage]);
  setLoading(true);

  const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: newMessages })
  });

  const data = await res.json();
  const reply = data.reply || "Sorry, something went wrong.";
  setMessages([...messages, userVisibleMessage, { role: 'assistant', content: reply }]);
  setLoading(false);
};



export default App;
