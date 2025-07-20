import React, { useEffect, useState, useRef } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [expectingLocation, setExpectingLocation] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicQuery, setClinicQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);   
  const messagesEndRef = useRef(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userText, setUserText] = useState('');
  useEffect(() => {
  const timer = setTimeout(() => setShowWelcome(false), 5000); // hide after 5 sec
  return () => clearTimeout(timer);
}, []);
  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem('visited');
    if (!alreadyVisited) {
      localStorage.removeItem('chat-history');
      sessionStorage.setItem('visited', 'true');
    }
    const saved = localStorage.getItem('chat-history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);
  useEffect(() => {
  const handleOffline = () => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: '⚠️ You are offline. First aid tips are still available.',
      },
    ]);
  };



  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('offline', handleOffline);
  };
}, []);

 useEffect(() => {
    if (userText.trim() !== '') {
      setShowWelcome(false);
    }
  }, [userText]);
useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Clean up
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
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setText(voiceText);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
     recognition.start();
  };
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};
useEffect(() => {
  scrollToBottom();
}, [messages]);

  const speakText = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === language);
    if (matchedVoice) utterance.voice = matchedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const fetchAIReply = async (userText, language = 'en-IN') => {
  const cohereKey = "4aj7T4WPvK1YZidYNeOCnYHN1MFjLLWMuPLdIL3N";
  const endpoint = "https://api.cohere.ai/v1/chat";

 const languageMap = {
  'en-IN': 'English',
  'hi-IN': 'हिन्दी',
  'bn-IN': 'বাংলা',
  'gu-IN': 'ગુજરાતી',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
  'mr-IN': 'मराठी',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'ur-IN': 'اردو'
};

  const selectedLanguage = languageMap[language] || 'English';

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${cohereKey}`,
  };

    const body = {
    message: `Answer in ${selectedLanguage}. Keep it short (1–2 sentences), but make sure it is clear and complete. Answer this: ${userText}`,
    model: "command-r-plus",
    temperature: 0.3, // More focused/precise
    max_tokens: 300, // More room for complete short answers
    chat_history: [],
  };


  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data.text?.trim() || "⚠️ कोई उत्तर नहीं मिला।";
  } catch (err) {
    console.error("Cohere Error:", err);
    return "⚠️ AI से संपर्क नहीं हो सका।";
  }
};



 const sendMessage = async () => {
  if (!text.trim()) return;

  const userMessage = {
    sender: 'user',
    text,
    replyTo: replyTo?.text || null  // ⬅️ include reply reference
  };

  setMessages((prev) => {
    const updated = [...prev, userMessage];
    localStorage.setItem('chat-history', JSON.stringify(updated));
    return updated;
  });
  

 if (expectingLocation) {
  const city = text.trim();
  setExpectingLocation(false);

  // 1. Add a temporary "Searching..." message
  const searchingId = Date.now(); // unique ID
  const searchingMessage = {
    id: searchingId,
    sender: 'bot',
    text: `🔍 Searching for clinics in ${city}...`,
  };

  setMessages((prev) => [...prev, searchingMessage]);

  // 2. Get clinics
  const clinicMessages = await searchClinicsWithNominatim(city);

  // 3. Format clinic responses
  const formatted = clinicMessages.map((msg) => ({
    sender: 'bot',
    text: msg.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'),
  }));

  // 4. Replace "searching..." message with actual clinics
  setMessages((prev) => {
    // Remove the searching message using ID
    const withoutSearching = prev.filter((m) => m.id !== searchingId);
    return [...withoutSearching, ...formatted];
  });

  setText('');
  return;
}
   
    setText('');
    setIsLoading(true);
    const prompt = replyTo
  ? `Follow-up on: "${replyTo.text}". User says: "${text}"`
  : text;

const botReply = await fetchAIReply(prompt, language);



// Optional trimming logic (to avoid extremely long replies)
const maxLength = 400;
const finalReply = botReply.length > maxLength
  ? botReply.slice(0, maxLength).trim() + '...'
  : botReply;

const botMessage = { sender: 'bot', text: finalReply };


setMessages((prev) => {
  const updated = [...prev, botMessage];
  localStorage.setItem('chat-history', JSON.stringify(updated));
  return updated;
});
 // Use full response
 // use shortened text here too
setIsLoading(false);

  };

  const searchClinics = async () => {
  if (!clinicQuery.trim()) {
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: '⚠️ Please enter your city to find clinics.' },
    ]);
    return;
  }

  const fakeClinics = [
    { name: "Apollo Clinic", address: `${clinicQuery} Apollo Clinic` },
    { name: "CityCare Hospital", address: `${clinicQuery} CityCare Hospital` },
    { name: "LifeLine Medical Centre", address: `${clinicQuery} LifeLine Medical Centre` }
  ];

  const introMessage = { sender: 'bot', text: `🔍 Searching for clinics in ${clinicQuery}...` };
  const clinicLinks = fakeClinics.map(clinic => ({
    sender: 'bot',
    text: `🏥 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}" target="_blank">${clinic.name}</a>`
  }));

  setMessages((prev) => [...prev, introMessage, ...clinicLinks]);
  setClinicQuery(''); // Optional: clear input after search
};

// Example: React function to fetch nearby clinics using OpenStreetMap (Nominatim)

const searchClinicsWithNominatim = async (city) => {
  const query = `clinic in ${encodeURIComponent(city)}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your@email.com)'  // Required by Nominatim usage policy
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch clinics');
    }

    const data = await response.json();

    if (data.length === 0) {
      return [`❌ No clinics found in ${city}`];
    }

    const clinics = data.slice(0, 5).map(item => {
      const name = item.display_name.split(',')[0];
      const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.display_name)}`;
      return `🏥 [${name}](${link})`;
    });

    return clinics;
  } catch (error) {
    return [`❗ Error: ${error.message}`];
  }
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
    setMessages((prev) => [...prev, ...tips]);
  };

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
  color: white; 
}

          .chat-message a:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' , marginTop: '22px'}}>

      <div style={{
  width: '100%',
  maxWidth: '520px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: '10px'
}}>
  {/* Hamburger Icon */}
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    style={{
      position: 'absolute',
      left: '0',
      fontSize: '31px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      paddingLeft: '5px'  // optional tighter spacing
    }}
  >
    ☰
  </button>
  {/* Dropdown Menu */}
{menuOpen && (
  <div
    style={{
      position: 'absolute',
      top: '80px',
      left: '0',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '120px',
    }}
  >
    <div
      onClick={() => {
        
        setMessages([]);         // Clear all chat messages
  setText('');             // Clear the input field
  localStorage.removeItem('chat-history');
        setMenuOpen(false);
      }}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
      }}
      onMouseEnter={e => (e.target.style.background = '#f0f0f0ff')}
      onMouseLeave={e => (e.target.style.background = '#fff')}
    >
      New Chat
    </div>

    <div
      onClick={() => {
  setExpectingLocation(true);
  setMessages(prev => [
    ...prev,
    { sender: 'bot', text: '📍 Please enter your city to find nearby clinics.' }
  ]);
  setMenuOpen(false);


      }}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
      }}
      onMouseEnter={e => (e.target.style.background = '#f0f0f0')}
      onMouseLeave={e => (e.target.style.background = '#fff')}
    >
      Find Clinic
    </div>

    <div
      onClick={() => {
        sendHealthTips(); // Your predefined first aid tips
        setMenuOpen(false);
      }}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.target.style.background = '#f0f0f0')}
      onMouseLeave={e => (e.target.style.background = '#fff')}
    >
      First Aid
    </div>
  </div>
)}


  {/* Heading Centered */}
  <div style={{
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  marginBottom: '20px',
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
  marginTop: '18px'
  
}}>
  <span style={{ fontSize: '1.8rem' }}>🏥</span>
  <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>भारत हेल्थ साथी</span>
  <span style={{ fontSize: '1.5rem', color: '#09065eff'}}> Bharat Health Ally</span>
</div>

</div>



        <div
  id="chat-window"
  style={{
    height: '480px',
    width: '490px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#fdfdfd',
    borderRadius: '16px', // ⤴️ Rounded corners
    boxShadow: '0 4px 12px rgba(173, 216, 230, 0.5)' // ⤴️ Light blue shadow
  }}
>
  {showWelcome && (
  <div style={{
    height:'90px',
    color: '#007bff',
    backgroundColor: '#e6f2ff',
    padding: '10px 20px',
    borderRadius: '10px',
    marginBottom: '10px',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: '500'
  }}>
    <h3>👋  Welcome to सेहत साथी!</h3>
  </div>
  
)}

      {messages.map((msg, idx) => {
  const isBot = msg.sender === 'bot';
  const isHovered = hoveredMessageIndex === idx;

  return (
    <div
      key={idx}
      onMouseEnter={() => setHoveredMessageIndex(idx)}
      onMouseLeave={() => setHoveredMessageIndex(null)}
      style={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '8px',
        position: 'relative'
      }}
    >
      <div className="chat-message" style={{
        backgroundColor: isBot ? '#164c85ff' : '#c4e9f7ff',   // bot: dark blue, user: light blue
color: isBot ? '#ffffffff' : '#060011ff',            // bot text: white, user text: black

        borderRadius: '12px',
        padding: '8px 12px',
        maxWidth: '80%',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        fontSize: '14px',
        position: 'relative'
      }}>
        {msg.replyTo && (
  <div style={{
    backgroundColor: '#e0e0e0',
    padding: '4px 8px',
    borderLeft: '3px solid #0077cc',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '4px',
    color: '#333'
  }}>
    {msg.replyTo}
  </div>
)}

        <span dangerouslySetInnerHTML={{ __html: msg.text }} />
      


       {isBot && isHovered && (
  <div style={{
    position: 'absolute',
    top: '50%',
    right: '-65px',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center'
  }}>
    <button
      onClick={() => {
    setReplyTo(msg);   // Set message to reply
    setText('');       // Optional: clear input
  }}
      style={{
        fontSize: '16px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer'
      }}
      title="Reply"
    >
      ↪
    </button>
    <button
      onClick={() => speakText(msg.text)}
      style={{
        fontSize: '16px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer'
      }}
      title="Read Aloud"
    >
      🔈
    </button>
  </div>
)}


      </div>
    </div>
  );
})}

          <div ref={messagesEndRef} />

          {isLoading && <div style={{ textAlign: 'left', fontStyle: 'italic', color: '#666' }}>Bot is typing...</div>}
        </div>

        {/* Message Input & Controls */}
        <div style={{
  width: '490px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
  background: '#fff',
  borderRadius: '20px',
  padding: '6px 10px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  border: '1px solid #ccc'
}}>
  {replyTo && (
  <div style={{
    backgroundColor: '#f1f1f1',
    borderLeft: '4px solid #0077cc',
    padding: '6px 10px',
    borderRadius: '8px',
    marginBottom: '6px',
    width: '490px', 
    maxHeight: '60px', 
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
        Replying to {replyTo.sender === 'bot' ? 'Bot' : 'You'}:
      </div>
      <div style={{ fontSize: '12px', color: '#333' }}>{replyTo.text}</div>
    </div>
    <button onClick={() => setReplyTo(null)} style={{
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#0077cc',
      marginLeft: '8px'
    }}>
      ✖
    </button>
  </div>
)}


  <input
    type="text"
    value={text}
    placeholder="Type or speak your question..."
    onChange={(e) => setText(e.target.value)}
    onKeyDown={(e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage(); // your function to send the message
  }
}}

    style={{
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      padding: '6px'
    }}
  />
  <button
    onClick={sendMessage}
    title="Send"
    style={{
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      marginLeft: '6px'
    }}
  >
    ⬆️
  </button>
  <button
    onClick={startListening}
    title="Speak"
    style={{
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      marginLeft: '6px'
    }}
  >
    🎤
  </button>
</div>


       <div style={{ 
  marginBottom: '15px', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px' 
}}>
  <label
  style={{
    fontWeight: 'bold',
    color: '#003366', // Dark blue for "Language" label
    marginRight: '8px',
    fontSize: '15px',
  }}
>
  Language:
</label>

<select
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
  style={{
    padding: '6px 12px',
    borderRadius: '20px', // More curved
    boxShadow: '0 2px 6px rgba(69, 127, 204, 0.1)',
    border: '1px solid #ccc',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontSize: '14px',
    minWidth: '160px',
    transition: 'all 0.3s ease-in-out',
  }}
  onMouseEnter={(e) => (e.target.style.backgroundColor = '#e6f0ff')} // Light blue on hover
  onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}    // Reset on leave
>
    {languageOptions.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.name}
      </option>
    ))}
  </select>
</div>

      </div>
    </>
  );
};

export default ChatBot;
