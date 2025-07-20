import React from 'react';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div
      style={{
        fontFamily: 'Arial',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1500px',
        margin: '0 auto',
        backgroundImage:
          'url("https://i.postimg.cc/gJtJcKjC/upscalemedia-transformed.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '-10px center ',
        backgroundAttachment: 'fixed',
        minHeight: '100vh', // Ensures full height background
        width: '100%',      // Makes sure it spans the full width
      }}
    >
     <div
  style={{
    position:'fixed',
  }}
>
  <ChatBot />
</div>
    </div>
  );
}

export default App;
