// lib/socket.js
import { io } from 'socket.io-client';

// Use the exact origin (IP address or domain) serving the page in the browser
const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});