import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem('visited');

    if (!alreadyVisited) {
      localStorage.removeItem('chat-history');
      sessionStorage.setItem('visited', 'true');
    }

    const saved = localStorage.getItem('chat-history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
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
      alert('Speech Recognition not supported in this browser.');
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
    window.speechSynthesis.speak(utterance);
  };

const fetchAIReply = async (userText) => {
  try {
    const response = await axios.post(
  'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', // ✅ correct endpoint
  {
    contents: [
      {
        parts: [{ text: userText }],
      },
    ],
  },
  {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      key: process.env.REACT_APP_GEMINI_API_KEY, // ✅ or hardcode temporarily to test
    },
  }
);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return '⚠️ Gemini से जवाब प्राप्त करने में त्रुटि हुई।';
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>🤖 भारत हेल्थ चैटबोट</h2>

      <div
        id="chat-window"
        style={{
          height: '400px',
          width: '350px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#fdfdfd',
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '6px' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
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

      <div>
        <label>Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChatBot;
