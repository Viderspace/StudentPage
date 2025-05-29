import { useState, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const fetchPrompt = async () => {
      const sessionId = prompt("Enter the lesson code given by your teacher:");
      if (!sessionId) {
        setMessages([{ role: 'system', content: '❌ No session ID provided.' }]);
        return;
      }

      try {
        const res = await fetch(`https://teacher-backend-production.up.railway.app/get-tutor-prompt?session=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (data.prompt) {
          const systemMsg = { role: 'system', content: data.prompt };
          setSystemPrompt(systemMsg);
          setMessages([]); // Reset to blank while we fetch the first reply

          // 👇 Initial assistant reply based on prompt
          const replyRes = await fetch('https://studentbackend-production.up.railway.app/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [systemMsg, { role: 'user', content: 'Introduce the topic to the student and explain how you can help.' }] })
          });

          const replyData = await replyRes.json();
          const assistantReply = replyData.reply || "שלום! אני כאן לעזור לך ללמוד.";

          setMessages([
            { role: 'assistant', content: assistantReply }
          ]);
        } else {
          setMessages([{ role: 'system', content: '❌ Prompt not found for this session.' }]);
        }
      } catch (err) {
        console.error(err);
        setMessages([{ role: 'system', content: '❌ Failed to load the session prompt.' }]);
      }
    };

    fetchPrompt();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !systemPrompt) return;

    const userMessage = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    const fullMessages = [systemPrompt, ...currentMessages];

    setMessages(currentMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://studentbackend-production.up.railway.app/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: fullMessages })
      });

      const data = await res.json();
      const reply = data.reply || "סליחה, חלה שגיאה";
      setMessages([...currentMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([...currentMessages, { role: 'assistant', content: "❌ שגיאה במציאת מורה מלווה" }]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
  }, []);

  const readAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = voices.find(v => v.name.includes("Apple"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    speechSynthesis.speak(utterance);
  };

  const extractYouTubeId = (text) => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div>
      <h1>מורה מלווה לסטודנט</h1>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map((msg, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p>{msg.content}</p>
              {msg.role === 'assistant' && (
                <button onClick={() => readAloud(msg.content)}>🔊 הקראה</button>
              )}
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
      {/* <button onClick={handleSend} disabled={loading}>
        {loading ? "שליחה..." : "Send"}
      </button> */}
    </div>
  );
}

export default App;
