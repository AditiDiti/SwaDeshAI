import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!navigator.onLine) {
      return '⚠️ आप अभी ऑफ़लाइन हैं। कृपया इंटरनेट चालू करें।';
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userText }],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'OpenAI-Project': 'proj_xFmglWQiXMmF4wWQ0qCVkE7h',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Error:', error);
      return 'AI से जवाब प्राप्त करने में त्रुटि हुई।';
    }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en-IN') return text;

    const langMap = {
      'hi-IN': 'Hindi',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'mr-IN': 'Marathi',
      'pa-IN': 'Punjabi',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'ur-IN': 'Urdu',
    };

    const targetLanguageName = langMap[targetLang] || 'Hindi';

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `Translate the following to ${targetLanguageName} but keep medical/health terms unchanged.` },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'OpenAI-Project': 'proj_xFmglWQiXMmF4wWQ0qCVkE7h',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    setMessages(prev => {
      const updated = [...prev, userMessage];
      localStorage.setItem('chat-history', JSON.stringify(updated));
      return updated;
    });

    setText('');
    setIsLoading(true);

    const aiReply = await fetchAIReply(text);
    const translatedReply = await translateText(aiReply, language);

    const botMessage = { sender: 'bot', text: translatedReply };
    setMessages(prev => {
      const updated = [...prev, botMessage];
      localStorage.setItem('chat-history', JSON.stringify(updated));
      return updated;
    });

    speakText(translatedReply);
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
          backgroundColor: '#fdfdfd'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '6px' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'left', fontStyle: 'italic', color: '#666' }}>Bot is typing...</div>
        )}
      </div>

      <div style={{ width: '350px', display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          value={text}
          placeholder="Type or speak your question..."
          onChange={e => setText(e.target.value)}
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
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChatBot;
