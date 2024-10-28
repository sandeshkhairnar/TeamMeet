import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Room.css'
import {
  Mic, MicOff, Video, VideoOff,
  MessageSquare, LogOut, Users,
  Settings, Download, MonitorUpIcon
} from 'lucide-react';

const socket = io('http://localhost:3000');

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [videoQuality, setVideoQuality] = useState('high');
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const messagesEndRef = useRef(null);
  const screenStreamRef = useRef(null);

  const videoConstraints = {
    high: { width: 1280, height: 720 },
    medium: { width: 640, height: 480 },
    low: { width: 320, height: 240 }
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const changeVideoQuality = async (quality) => {
    if (!localStreamRef.current) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints[quality],
        audio: true
      });

      const videoTrack = newStream.getVideoTracks()[0];
      const sender = Object.values(peerConnections.current).map(pc =>
        pc.getSenders().find(s => s.track?.kind === 'video')
      );

      sender.forEach(s => s && s.replaceTrack(videoTrack));

      const oldTrack = localStreamRef.current.getVideoTracks()[0];
      localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(videoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setVideoQuality(quality);
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Error changing video quality:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        screenStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenSharing();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenSharing = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoConstraints[videoQuality],
          audio: true 
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit('join-room', roomId);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMediaStream();

    const handleUserConnected = (userId) => {
      const peerConnection = createPeerConnection(userId);
      peerConnections.current[userId] = peerConnection;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }
    };

    const handleUserDisconnected = (userId) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
        setParticipants(prev => prev.filter(p => p.id !== userId));
      }
    };

    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-connected', handleUserConnected);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.disconnect();
    };
  }, [roomId, videoQuality]);

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.ontrack = (event) => {
      setParticipants(prev => {
        const exists = prev.find(p => p.id === userId);
        if (exists) return prev;

        const videoRef = { current: new MediaStream() };
        event.streams[0].getTracks().forEach(track => {
          videoRef.current.addTrack(track);
        });

        return [...prev, {
          id: userId,
          name: `Username ${prev.length + 1}`,
          videoRef,
          isMuted: false,
          isLocal: false
        }];
      });
    };

    return peerConnection;
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const chatMessage = {
      roomId,
      message,
      sender: 'You',
      timestamp: new Date().toISOString()
    };
    
    socket.emit('chat-message', chatMessage);
    setMessages(prev => [...prev, chatMessage]);
    setMessage('');
  };

  return (
    <div className="flex h-screen bg-dark">
      {/* Left Sidebar */}
      <div className="w-16 bg-sidebar flex flex-col items-center py-4 space-y-6">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
          className="sidebar-btn bg-blue-500"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
          className="sidebar-btn bg-gray-700"
        >
          <Users className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={toggleScreenShare}
          className={`sidebar-btn ${isScreenSharing ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <MonitorUpIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Local Video */}
          <div className="video-item">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="participant-video"
            />
            <div className="participant-info">
              <span className="participant-name">You</span>
              {!isAudioEnabled && (
                <div className="muted-indicator">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {!isVideoEnabled && (
              <div className="video-placeholder">
                <div className="avatar">You</div>
              </div>
            )}
          </div>

          {/* Remote Participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="video-item">
              <video
                ref={participant.videoRef}
                autoPlay
                playsInline
                className="participant-video"
              />
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                {participant.isMuted && (
                  <div className="muted-indicator">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-sidebar flex items-center justify-center space-x-4">
        <button 
          onClick={toggleAudio}
          className={`control-btn ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5 text-gray-300" />
          ) : (
            <MicOff className="w-5 h-5 text-white" />
          )}
        </button>

        <button 
          onClick={toggleVideo}
          className={`control-btn ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5 text-gray-300" />
          ) : (
            <VideoOff className="w-5 h-5 text-white" />
          )}
        </button>

        <button 
          onClick={() => setIsChatVisible(!isChatVisible)}
          className={`control-btn bg-gray-700 ${isChatVisible ? 'active' : ''}`}
        >
          <MessageSquare className="w-5 h-5 text-gray-300" />
        </button>

        <button 
          onClick={() => navigate('/')}
          className="control-btn bg-red-500"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="text-white text-lg mb-4">Video Quality Settings</h3>
            <div className="space-y-2">
              <button
                onClick={() => changeVideoQuality('high')}
                className={`quality-btn ${videoQuality === 'high' ? 'active' : ''}`}
              >
                High Quality (720p)
              </button>
              <button
                onClick={() => changeVideoQuality('medium')}
                className={`quality-btn ${videoQuality === 'medium' ? 'active' : ''}`}
              >
                Medium Quality (480p)
              </button>
              <button
                onClick={() => changeVideoQuality('low')}
                className={`quality-btn ${videoQuality === 'low' ? 'active' : ''}`}
              >
                Low Quality (240p)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants List Modal */}
      {isParticipantListOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="text-white text-lg mb-4">Participants</h3>
            <div className="space-y-2">
              <div className="participant-item">
                You (Host)
              </div>
              {participants.map(participant => (
                <div key={participant.id} className="participant-item">
                  {participant.name}
                  {participant.isMuted && (
                    <MicOff className="w-4 h-4 inline ml-2 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      {isChatVisible && (
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Chat</h2>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  {msg.message}
                </div>
                <div className="message-info">
                  <span className="sender">{msg.sender}</span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Room;