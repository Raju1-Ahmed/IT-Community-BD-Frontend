import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socketInstance = null;

export const getSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      autoConnect: true,
      auth: { token },
      transports: ["websocket", "polling"]
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
};
