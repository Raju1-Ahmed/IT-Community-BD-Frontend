import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";
import { getSocket } from "../lib/socket";

const UnreadMessagesContext = createContext(null);

const getMessagePreview = (message) =>
  message?.text || (message?.attachments?.length ? "Shared an attachment" : "New message");

export const UnreadMessagesProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadByConversation, setUnreadByConversation] = useState({});

  const loadUnreadCounts = useCallback(async () => {
    if (!user) {
      setUnreadByConversation({});
      return;
    }

    try {
      const { data } = await api.get("/messages/conversations", { meta: { skipLoader: true } });
      const next = {};
      (data?.conversations || []).forEach((conversation) => {
        const count = Number(conversation?.unreadCount || 0);
        if (count > 0) next[String(conversation.id)] = count;
      });
      setUnreadByConversation(next);
    } catch (_error) {
      // The messages page remains usable if the badge request fails.
    }
  }, [user]);

  const markConversationRead = useCallback((conversationId) => {
    if (!conversationId) return;
    setUnreadByConversation((current) => {
      if (!current[conversationId]) return current;
      const next = { ...current };
      delete next[conversationId];
      return next;
    });
    getSocket()?.emit("message:seen", { conversationId });
  }, []);

  useEffect(() => {
    loadUnreadCounts();
  }, [loadUnreadCounts]);

  useEffect(() => {
    if (!user) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    const handleNotification = ({ conversationId, message }) => {
      if (String(message?.senderId || "") === String(user.id || "")) return;
      setUnreadByConversation((current) => ({
        ...current,
        [conversationId]: (current[conversationId] || 0) + 1
      }));
    };

    const handleSeen = ({ conversationId, userId }) => {
      if (String(userId) !== String(user.id || "")) return;
      setUnreadByConversation((current) => {
        if (!current[conversationId]) return current;
        const next = { ...current };
        delete next[conversationId];
        return next;
      });
    };

    socket.on("message:notification", handleNotification);
    socket.on("message:seen", handleSeen);
    return () => {
      socket.off("message:notification", handleNotification);
      socket.off("message:seen", handleSeen);
    };
  }, [user]);

  const unreadTotal = Object.values(unreadByConversation).reduce((total, count) => total + count, 0);
  const unreadConversationCount = Object.keys(unreadByConversation).length;
  const value = useMemo(() => ({
    unreadByConversation,
    unreadTotal,
    unreadConversationCount,
    markConversationRead,
    refreshUnreadCounts: loadUnreadCounts,
    getMessagePreview
  }), [loadUnreadCounts, markConversationRead, unreadByConversation, unreadConversationCount, unreadTotal]);

  return <UnreadMessagesContext.Provider value={value}>{children}</UnreadMessagesContext.Provider>;
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) throw new Error("useUnreadMessages must be used within UnreadMessagesProvider");
  return context;
};
