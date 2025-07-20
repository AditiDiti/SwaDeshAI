import React, { useEffect, useState } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicQuery, setClinicQuery] = useState('');

  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem('visited');
    if (!alreadyVisited) {
      localStorage.removeItem('chat-history');
      sessionStorage.setItem('visited', 'true');
    }
    const saved = localStorage.getItem('chat-history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;
  }

  const startListening = () => {
    if (!recognition) {
      alert('Speech Recognition not supported.');
      return;
    }
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setText(voiceText);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const speakText = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === language);
    if (matchedVoice) utterance.voice = matchedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const fetchAIReply = async (userText) => {
    const cohereKey = "4aj7T4WPvK1YZidYNeOCnYHN1MFjLLWMuPLdIL3N";
    const endpoint = "https://api.cohere.ai/v1/chat";

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cohereKey}`,
    };

    const body = {
      message: userText,
      model: "command-r-plus",
      temperature: 0.7,
      max_tokens: 300,
      chat_history: [],
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data.text || "⚠️ कोई उत्तर नहीं मिला।";
    } catch (err) {
      console.error("Cohere Error:", err);
      return "⚠️ AI से संपर्क नहीं हो सका।";
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const userMessage = { sender: 'user', text };
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      localStorage.setItem('chat-history', JSON.stringify(updated));
      return updated;
    });

    setText('');
    setIsLoading(true);
    const botReply = await fetchAIReply(text);
    const botMessage = { sender: 'bot', text: botReply };
    setMessages((prev) => {
      const updated = [...prev, botMessage];
      localStorage.setItem('chat-history', JSON.stringify(updated));
      return updated;
    });
    speakText(botReply);
    setIsLoading(false);
  };

  const searchClinics = async () => {
    if (!clinicQuery.trim()) return;
    setIsLoading(true);
    const userMessage = { sender: 'user', text: `Clinics near ${clinicQuery}` };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=clinic near ${encodeURIComponent(clinicQuery)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.length === 0) {
        const msg = `⚠️ No clinics found near "${clinicQuery}".`;
        setMessages((prev) => [...prev, { sender: 'bot', text: msg }]);
        speakText(msg);
      } else {
        const intro = { sender: 'bot', text: '🧭 Nearby clinics:' };
        const clinicMessages = data.slice(0, 5).map((place) => ({
          sender: 'bot',
          text: `📍 <a href="https://www.google.com/maps?q=${encodeURIComponent(place.display_name)}" target="_blank">${place.display_name}</a><br/><br/>`
        }));

        setMessages((prev) => {
          const updated = [...prev, intro, ...clinicMessages];
          localStorage.setItem('chat-history', JSON.stringify(updated));
          return updated;
        });
        speakText(`Nearby clinics found: ${clinicMessages.length}`);
      }
    } catch (err) {
      console.error(err);
      const msg = "⚠️ Error fetching clinic data.";
      setMessages((prev) => [...prev, { sender: 'bot', text: msg }]);
    }
    setIsLoading(false);
  };

  const healthTips = [
    "🩹 For small cuts, rinse with clean water and apply antiseptic.",
    "🔥 For minor burns, hold under cool running water for 10 minutes.",
    "🤒 For fever, rest well and drink plenty of fluids.",
    "🚶‍♀️ Walk for at least 30 minutes daily to improve heart health.",
    "🧴 Use sunscreen when outdoors to prevent sunburn.",
    "🧘‍♂️ Practice deep breathing or yoga to reduce stress.",
    "💧 Stay hydrated — aim for 8 glasses of water daily.",
    "🧼 Wash hands frequently to prevent infections.",
  ];

  const sendHealthTips = () => {
    const tips = healthTips.map((tip) => ({ sender: 'bot', text: tip }));
    setMessages((prev) => {
      const updated = [...prev, ...tips];
      localStorage.setItem('chat-history', JSON.stringify(updated));
      return updated;
    });

    tips.forEach((tip, i) => {
      setTimeout(() => speakText(tip.text), i * 2500);
    });
  };

  useEffect(() => {
    const chatDiv = document.getElementById('chat-window');
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  }, [messages]);

  const languageOptions = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'gu-IN', name: 'Gujarati' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'mr-IN', name: 'Marathi' },
    { code: 'pa-IN', name: 'Punjabi' },
    { code: 'kn-IN', name: 'Kannada' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'ur-IN', name: 'Urdu' },
  ];

  return (
    <>
      <style>
        {`
          .chat-message a {
            text-decoration: none;
            color: #0077cc;
          }

          .chat-message a:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px', lineHeight: '1.2' }}>
  <h2 style={{ margin: '0', fontSize: '1.4rem' }}>🤖 भारत हेल्थ साथी</h2>
  <div style={{ fontSize: '1rem', color: '#555' }}>Bharat Health Ally</div>
</div>



        <div
          id="chat-window"
          style={{
            height: '400px',
            width: '350px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fdfdfd'
          }}
        >
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            const isClinicLink = msg.text.includes('<a href="https://www.google.com/maps');

            return (
              <div
  key={idx}
  style={{
    display: 'flex',
    justifyContent: isBot ? 'flex-start' : 'flex-end',
    marginBottom: '8px',
  }}
>
  <div
    className="chat-message"
    style={{
      backgroundColor: isBot ? '#E3F2FD' : '#D3D3D3',
      color: '#212529',
      borderRadius: '12px',
      padding: '8px 12px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontSize: '14px',
    }}
  >
    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
  </div>
</div>


            );
          })}

          {isLoading && <div style={{ textAlign: 'left', fontStyle: 'italic', color: '#666' }}>Bot is typing...</div>}
        </div>

        <div style={{ width: '350px', display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={text}
            placeholder="Type or speak your question..."
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={startListening}>🎤</button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>{isListening ? '🎙️ Listening...' : '🎧 Mic Idle'}</strong>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '350px', display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter your city (e.g., Delhi)"
            value={clinicQuery}
            onChange={(e) => setClinicQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={searchClinics}>Find Clinics</button>
        </div>

        <div style={{ width: '350px', marginBottom: '10px' }}>
          <button onClick={sendHealthTips} style={{ width: '100%' }}>
            🩺 Show First Aid & Wellness Tips
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
