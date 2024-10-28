// src/pages/Messages.js
import React, { useState } from 'react';
import './Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      setMessages([...messages, { text: message, sender: 'You' }]);
      setMessage('');
    }
  };

  return (
    <div className="messages-container">
      <h2>Chat</h2>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="send-message-form">
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="message-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Messages;
