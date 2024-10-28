// src/pages/Meeting.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Meeting = () => {
  const { roomId } = useParams();

  useEffect(() => {
    // Initialize your video conferencing SDK or logic here
    console.log(`Joining room: ${roomId}`);

    // Example: Setup WebRTC, join room logic, etc.

    return () => {
      // Cleanup logic, e.g., leaving the room
      console.log(`Left room: ${roomId}`);
    };
  }, [roomId]);

  return (
    <div>
      <h1>Meeting Room: {roomId}</h1>
      {/* Add video and chat components here */}
      <div id="video-container">
        {/* Video elements will be rendered here */}
      </div>
    </div>
  );
};

export default Meeting;
