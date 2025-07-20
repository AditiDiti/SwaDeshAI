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
      <ChatBot />
    </div>
  );
}

export default App;
