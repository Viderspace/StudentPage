import { useState, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `You are a helpful, efficient, and concise AI tutor in pythagorean theorem. Your sole goal is to help the student 
      understand and learn the material provided by the teacher. You should adapt your teaching style to 
      fit the student's specific needs and preferences, which will be included in the context.
      
      Follow this flow:
      1. Understand the provided material (lesson plan, grade level, needs).
      2. Begin an interactive conversation with the student.
      3. Adapt teaching style (audio, written, short videos, etc.) based on student needs.
      4. Continue until key topics are understood. And the user answers 5 questions correctly about the topic

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
      // const res = await fetch('https://teacher-backend-production.up.railway.app/lesson');
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
      const reply = data.reply || "סליחה, חלה שגיאה";

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([...newMessages, { role: 'assistant', content: "❌ שגיאה במציאת מורה מלווה" }]);
    }

    setLoading(false);
  };

  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Some browsers require this event
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Call it once in case voices are already loaded
  }, []);

  // 🔊 Use browser TTS
  const readAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Example: Choose a more natural voice
    const preferredVoice = voices.find(
      v => v.name.includes("Apple") // v.lang.startsWith('he')
    );
  
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  
    speechSynthesis.speak(utterance);
  };
  

  // 🎥 Extract YouTube Video ID
  const extractYouTubeId = (text) => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([\w-]{11})/);
    return match ? match[1] : null;
  };


  return (
    <div>
      <h1>מורה</h1>
  
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map((msg, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p>{msg.content}</p>

              {/* 🔊 Read Aloud Button (Only for assistant messages) */}
              {msg.role === 'assistant' && (
                <button onClick={() => readAloud(msg.content)}>🔊 הקראה</button>
              )}

              {/* 📺 Show YouTube Video if any link exists */}
              {msg.role === 'assistant' && extractYouTubeId(msg.content) && (
                <div style={{ marginTop: '0.5rem' }}>
                  <iframe
                    width="320"
                    height="180"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(msg.content)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="וידאו"
                  ></iframe>
                </div>
              )}
            </div>
          ))}
      </div>

  
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="נא להקליד הודעה..."
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "שליחה..." : "Send"}
      </button>
    </div>
  );
}

export default App;