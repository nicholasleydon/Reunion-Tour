// lib/socket.js
import { io } from 'socket.io-client';

// Automatically bind to whatever hostname/port the browser is using
const socketUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'], // Try websocket first
  extraHeaders: {
    'ngrok-skip-browser-warning': 'true'
  }
});