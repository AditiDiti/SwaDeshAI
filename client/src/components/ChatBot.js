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

    // Optional: match language voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === language);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

const fetchAIReply = async (userText) => {
  const cohereKey = "4aj7T4WPvK1YZidYNeOCnYHN1MFjLLWMuPLdIL3N"; // 🔒 Replace with your real key
  const endpoint = "https://api.cohere.ai/v1/chat";

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${cohereKey}`,
  };

  const body = {
    message: userText,
    model: "command-r-plus", // or "command-r"
    temperature: 0.7,         // you can tweak this
    max_tokens: 300,
    chat_history: [],         // you can add history if you want
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Cohere Raw Response:", data);

    if (data.text) {
      return data.text;
    } else {
      return "⚠️ Cohere से जवाब नहीं मिला।";
    }
  } catch (error) {
    console.error("Cohere API Error:", error);
    return "⚠️ Cohere API से संपर्क नहीं हो सका।";
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

    const botReply = await fetchAIReply(text, language);

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
