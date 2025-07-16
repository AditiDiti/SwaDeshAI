import React from 'react';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div style={{
  fontFamily: 'Arial',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '1500px',     // ⬅️ reduce total width
  margin: '0 auto'        // ⬅️ center horizontally
}}>

      <h1 style={{ fontSize: '28px', color: '#007b5e' }}>
        भारत हेल्थ साथी (Bharat Health Ally)
      </h1>
      <ChatBot />
    </div>
  );
}

export default App;
