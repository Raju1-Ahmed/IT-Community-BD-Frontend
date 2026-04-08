import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, Loader2, MessageSquare, Paperclip, Search, Send } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../lib/socket";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const toAbsoluteUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${BACKEND_ORIGIN}${value}`;
};

const formatConversationTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

const formatMessageTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatMessageDayLabel = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" });
};

const buildPreview = (conversation) => {
  const text = String(conversation?.lastMessageText || "").trim();
  if (text) return text;
  return conversation?.lastMessageType === "file" ? "Shared an attachment" : "No messages yet";
};

const normalizeConversation = (conversation) => ({
  id: String(conversation?.id || ""),
  participant: {
    id: String(conversation?.participant?.id || ""),
    name: conversation?.participant?.name || "Unknown user",
    role: conversation?.participant?.currentPosition || conversation?.participant?.role || "Professional",
    status: conversation?.participant?.location || "Available for chat",
    profileImage: conversation?.participant?.profileImage || "",
    email: conversation?.participant?.email || ""
  },
  lastMessageText: conversation?.lastMessageText || "",
  lastMessageType: conversation?.lastMessageType || "text",
  lastMessageAt: conversation?.lastMessageAt || "",
  unreadCount: Number(conversation?.unreadCount || 0)
});

const normalizeMessage = (message, userId) => ({
  id: String(message?.id || ""),
  conversationId: String(message?.conversationId || ""),
  senderId: String(message?.senderId || ""),
  sender: String(message?.senderId || "") === String(userId) ? "me" : "person",
  text: message?.text || "",
  attachments: Array.isArray(message?.attachments) ? message.attachments : [],
  time: formatMessageTime(message?.createdAt),
  createdAt: message?.createdAt || "",
  seen: Boolean(message?.seen)
});

const isPendingConversationId = (value) => String(value || "").startsWith("pending-");

const upsertConversation = (items, conversation) => {
  const next = normalizeConversation(conversation);
  const filtered = items.filter(
    (item) => item.id !== next.id && item.participant.id !== next.participant.id
  );
  return [next, ...filtered].sort(
    (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
  );
};

const appendUniqueMessage = (items, message) => {
  if (!message?.id) return items;
  if (items.some((item) => item.id === message.id)) return items;
  return [...items, message].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
};

const MessagePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [chatText, setChatText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [attachmentUploadProgress, setAttachmentUploadProgress] = useState({});
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef("");
  const requestedParticipantIdRef = useRef("");
  const messageEndRef = useRef(null);
  const composerRef = useRef(null);
  const pendingParticipantId = id || "";
  const backProfileId = location.state?.expertiseProfileId || "";

  const ensureConversationStarted = async (participantId) => {
    if (!participantId) return null;

    const { data } = await api.post(
      "/messages/conversations/start",
      { participantId },
      { meta: { skipLoader: true } }
    );

    if (!data?.conversation) return null;

    setConversations((current) => upsertConversation(current, data.conversation));
    setActiveConversationId(String(data.conversation.id));
    return normalizeConversation(data.conversation);
  };

  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  const candidateSeedConversation = useMemo(() => {
    if (!pendingParticipantId || !location.state?.candidateName) return null;
    return normalizeConversation({
      id: `pending-${pendingParticipantId}`,
      participant: {
        id: pendingParticipantId,
        name: location.state.candidateName,
        email: location.state.candidateEmail || "",
        currentPosition: location.state.candidateRole || "",
        location: "Available for chat",
        profileImage: ""
      },
      unreadCount: 0
    });
  }, [location.state, pendingParticipantId]);

  useEffect(() => {
    let ignore = false;

    const loadConversations = async () => {
      setLoadingConversations(true);
      setErrorMessage("");

      try {
        const { data } = await api.get("/messages/conversations", { meta: { skipLoader: true } });
        if (ignore) return;

        let nextConversations = Array.isArray(data?.conversations)
          ? data.conversations.map(normalizeConversation)
          : [];

        if (
          candidateSeedConversation &&
          !nextConversations.some((item) => item.participant.id === candidateSeedConversation.participant.id)
        ) {
          nextConversations = [candidateSeedConversation, ...nextConversations];
        }

        setConversations(nextConversations);

        if (!pendingParticipantId && nextConversations.length > 0) {
          setActiveConversationId((current) => current || nextConversations[0].id);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error?.response?.data?.message || "Failed to load conversations.");
        }
      } finally {
        if (!ignore) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      ignore = true;
    };
  }, [candidateSeedConversation, pendingParticipantId]);

  useEffect(() => {
    if (!pendingParticipantId || !user?.id) return;
    if (requestedParticipantIdRef.current === pendingParticipantId) return;

    let ignore = false;

    const openOrCreateConversation = async () => {
      try {
        requestedParticipantIdRef.current = pendingParticipantId;
        const conversation = await ensureConversationStarted(pendingParticipantId);
        if (ignore || !conversation) return;
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error?.response?.data?.message || "Failed to open this conversation.");
        }
      }
    };

    openOrCreateConversation();

    return () => {
      ignore = true;
    };
  }, [pendingParticipantId, user?.id]);

  useEffect(() => {
    if (!activeConversationId) return;
    if (isPendingConversationId(activeConversationId)) return;
    if (messagesByConversation[activeConversationId]) return;

    let ignore = false;

    const loadMessages = async () => {
      setLoadingMessages(true);

      try {
        const { data } = await api.get(`/messages/conversations/${activeConversationId}/messages`, {
          meta: { skipLoader: true }
        });
        if (ignore) return;

        const normalized = Array.isArray(data?.messages)
          ? data.messages.map((message) => normalizeMessage(message, user?.id))
          : [];

        setMessagesByConversation((current) => ({
          ...current,
          [activeConversationId]: normalized
        }));
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error?.response?.data?.message || "Failed to load conversation history.");
        }
      } finally {
        if (!ignore) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [activeConversationId, messagesByConversation, user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    socketRef.current = socket;

    const handleNewMessage = (incomingMessage) => {
      const normalized = normalizeMessage(incomingMessage, user?.id);

      setMessagesByConversation((current) => ({
        ...current,
        [normalized.conversationId]: appendUniqueMessage(current[normalized.conversationId] || [], normalized)
      }));

      setConversations((current) => {
        const existing = current.find((item) => item.id === normalized.conversationId);
        if (!existing) return current;

        return upsertConversation(current, {
          ...existing,
          id: normalized.conversationId,
          participant: {
            ...existing.participant,
            currentPosition: existing.participant.role
          },
          lastMessageText: normalized.text || normalized.attachments[0]?.name || "Attachment",
          lastMessageType: normalized.attachments.length ? (normalized.text ? "mixed" : "file") : "text",
          lastMessageAt: normalized.createdAt,
          unreadCount:
            normalized.conversationId === activeConversationRef.current || normalized.sender === "me"
              ? 0
              : (existing.unreadCount || 0) + 1
        });
      });

      if (normalized.conversationId === activeConversationRef.current) {
        socket.emit("message:seen", { conversationId: normalized.conversationId });
      }
    };

    const handleConversationUpdate = ({ conversationId, message }) => {
      setConversations((current) => {
        const existing = current.find((item) => item.id === conversationId);
        if (!existing) return current;

        return upsertConversation(current, {
          ...existing,
          id: conversationId,
          participant: {
            ...existing.participant,
            currentPosition: existing.participant.role
          },
          lastMessageText: message?.text || message?.attachments?.[0]?.name || "Attachment",
          lastMessageType: message?.type || (message?.attachments?.length ? "file" : "text"),
          lastMessageAt: message?.createdAt,
          unreadCount:
            conversationId === activeConversationRef.current || String(message?.senderId || "") === String(user?.id || "")
              ? 0
              : (existing.unreadCount || 0) + 1
        });
      });
    };

    const handleTyping = ({ conversationId, userId, userName }) => {
      if (conversationId === activeConversationRef.current && String(userId) !== String(user?.id || "")) {
        setTypingUser(userName || "Typing...");
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversationRef.current && String(userId) !== String(user?.id || "")) {
        setTypingUser("");
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:update", handleConversationUpdate);
    socket.on("message:typing", handleTyping);
    socket.on("message:stopTyping", handleStopTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("message:typing", handleTyping);
      socket.off("message:stopTyping", handleStopTyping);
    };
  }, [user?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId || isPendingConversationId(activeConversationId)) return undefined;

    socket.emit("conversation:join", { conversationId: activeConversationId });
    socket.emit("message:seen", { conversationId: activeConversationId });
    setTypingUser("");
    setConversations((current) =>
      current.map((item) => (item.id === activeConversationId ? { ...item, unreadCount: 0 } : item))
    );

    return () => {
      socket.emit("conversation:leave", { conversationId: activeConversationId });
    };
  }, [activeConversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversationId, messagesByConversation, typingUser]);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  useEffect(() => {
    if (!composerRef.current) return;
    composerRef.current.style.height = "0px";
    composerRef.current.style.height = `${Math.min(composerRef.current.scrollHeight, 180)}px`;
  }, [chatText]);

  const filteredPeople = conversations.filter((conversation) =>
    `${conversation.participant.name} ${conversation.participant.role} ${buildPreview(conversation)}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const activeConversation =
    filteredPeople.find((item) => item.id === activeConversationId) ||
    conversations.find((item) => item.id === activeConversationId) ||
    conversations[0] ||
    candidateSeedConversation;
  const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] || [] : [];
  const threadMessages = activeMessages.map((message, index) => {
    const previous = activeMessages[index - 1];
    const currentDay = formatMessageDayLabel(message.createdAt);
    const previousDay = previous ? formatMessageDayLabel(previous.createdAt) : "";

    return {
      ...message,
      showDayLabel: !previous || currentDay !== previousDay,
      dayLabel: currentDay
    };
  });

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeAttachment = (fileName) => {
    setAttachments((current) => current.filter((file) => file.name !== fileName));
    setAttachmentUploadProgress((current) => {
      const next = { ...current };
      delete next[fileName];
      return next;
    });
  };

  const handleTextChange = (event) => {
    const value = event.target.value;
    setChatText(value);

    if (!activeConversation?.id || !socketRef.current || isPendingConversationId(activeConversation.id)) return;

    socketRef.current.emit("message:typing", { conversationId: activeConversation.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("message:stopTyping", { conversationId: activeConversation.id });
    }, 1200);
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!activeConversation?.id) return;
    if (!chatText.trim() && attachments.length === 0) return;

    setSendingMessage(true);
    setErrorMessage("");

    try {
      let resolvedConversation = activeConversation;

      if (isPendingConversationId(activeConversation.id)) {
        resolvedConversation = await ensureConversationStarted(activeConversation.participant.id);
      }

      if (!resolvedConversation?.id || isPendingConversationId(resolvedConversation.id)) {
        throw new Error("Conversation is not ready yet.");
      }

      const uploadedAttachments = [];

      for (const file of attachments) {
        const formData = new FormData();
        formData.append("attachment", file);

        const { data } = await api.post("/messages/attachments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          meta: { skipLoader: true },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || file.size || 1;
            const value = Math.max(8, Math.round((progressEvent.loaded / total) * 100));
            setAttachmentUploadProgress((current) => ({
              ...current,
              [file.name]: value
            }));
          }
        });

        if (data?.attachment) {
          uploadedAttachments.push(data.attachment);
        }
      }

      const { data } = await api.post(
        `/messages/conversations/${resolvedConversation.id}/messages`,
        {
          text: chatText.trim(),
          attachments: uploadedAttachments
        },
        { meta: { skipLoader: true } }
      );

      if (data?.message) {
        const normalized = normalizeMessage(data.message, user?.id);
        setMessagesByConversation((current) => ({
          ...current,
          [resolvedConversation.id]: appendUniqueMessage(current[resolvedConversation.id] || [], normalized)
        }));

        setConversations((current) =>
          upsertConversation(current, {
            ...resolvedConversation,
            participant: {
              ...resolvedConversation.participant,
              currentPosition: resolvedConversation.participant.role
            },
            lastMessageText: normalized.text || normalized.attachments[0]?.name || "Attachment",
            lastMessageType: normalized.attachments.length ? (normalized.text ? "mixed" : "file") : "text",
            lastMessageAt: normalized.createdAt,
            unreadCount: 0
          })
        );
      }

      setChatText("");
      setAttachments([]);
      setAttachmentUploadProgress({});
      socketRef.current?.emit("message:stopTyping", { conversationId: resolvedConversation.id });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <MessageSquare size={14} /> Messages
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Inbox</h2>
          <p className="text-sm text-slate-600">Messenger-style conversation workspace for employer communication.</p>
        </div>

        {backProfileId ? (
          <Link
            to={`/appoint-expertise/${backProfileId}`}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to Details
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">People</p>
                <p className="mt-1 text-xs text-slate-500">Recent and active conversations</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {filteredPeople.length} active
              </div>
            </div>
            <div className="relative mt-4">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search people"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
            {loadingConversations ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full bg-slate-200" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-slate-200" />
                        <div className="h-3 w-24 rounded bg-slate-100" />
                        <div className="h-3 w-40 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {!loadingConversations && filteredPeople.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No conversations found yet.
              </div>
            ) : null}

            {filteredPeople.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  activeConversationId === conversation.id
                    ? "border-emerald-300 bg-emerald-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {conversation.participant.profileImage ? (
                    <img
                      src={toAbsoluteUrl(conversation.participant.profileImage)}
                      alt={conversation.participant.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {getInitials(conversation.participant.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{conversation.participant.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{conversation.participant.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                        <span className={`h-2.5 w-2.5 rounded-full ${activeConversationId === conversation.id ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-500">{buildPreview(conversation)}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {formatConversationTime(conversation.lastMessageAt) || conversation.participant.status}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {conversation.unreadCount ? "Unread" : "Up to date"}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            {activeConversation ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {activeConversation.participant.profileImage ? (
                    <img
                      src={toAbsoluteUrl(activeConversation.participant.profileImage)}
                      alt={activeConversation.participant.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {getInitials(activeConversation.participant.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{activeConversation.participant.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeConversation.participant.role} {user?.name ? `· chatting as ${user.name}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {activeConversation.participant.email || activeConversation.participant.status}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    Active conversation
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                    {activeMessages.length} messages
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-900">Select a conversation</p>
                <p className="mt-1 text-xs text-slate-500">Choose a person from the list to start chatting.</p>
              </div>
            )}
          </div>

          <div className="max-h-[460px] space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4">
            {loadingMessages ? (
              <div className="space-y-3 animate-pulse">
                <div className="mx-auto h-8 w-32 rounded-full bg-slate-100" />
                <div className="ml-auto h-20 w-64 max-w-[85%] rounded-2xl bg-emerald-100/70" />
                <div className="h-24 w-72 max-w-[85%] rounded-2xl bg-slate-100" />
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {!loadingMessages && activeConversation && activeMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No messages yet. Start the conversation from below.
              </div>
            ) : null}

            {threadMessages.map((item) => (
              <div key={item.id}>
                {item.showDayLabel ? (
                  <div className="mb-3 flex items-center justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
                      {item.dayLabel}
                    </span>
                  </div>
                ) : null}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    item.sender === "me"
                      ? "ml-auto max-w-[85%] border border-emerald-200 bg-emerald-50 text-slate-800"
                      : "max-w-[85%] border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-line">{item.text}</p>
                  {item.attachments.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.attachments.map((file) => (
                        <a
                          key={`${item.id}-${file.url}`}
                          href={toAbsoluteUrl(file.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          <Paperclip size={12} /> {file.name}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.time}</p>
                    {item.sender === "me" ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${item.seen ? "text-emerald-600" : "text-slate-400"}`}>
                        <CheckCheck size={12} /> {item.seen ? "Seen" : "Sent"}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {typingUser ? (
              <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                {typingUser} is typing...
              </div>
            ) : null}

            <div ref={messageEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Reply to {activeConversation?.participant.name || "conversation"}</p>
                <p className="text-xs text-slate-500">Press Enter to send, Shift + Enter for a new line.</p>
              </div>
              {attachments.length ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {attachments.length} file{attachments.length > 1 ? "s" : ""} ready
                </span>
              ) : null}
            </div>
            <textarea
              ref={composerRef}
              value={chatText}
              onChange={handleTextChange}
              onKeyDown={handleComposerKeyDown}
              placeholder="Write your message here..."
              disabled={!activeConversation || sendingMessage}
              className="min-h-[92px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-700">{file.name}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.name)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  {sendingMessage && attachmentUploadProgress[file.name] ? (
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${attachmentUploadProgress[file.name]}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">Uploading {attachmentUploadProgress[file.name]}%</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 ${activeConversation ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-60"}`}>
                <Paperclip size={15} /> Share Files
                <input type="file" multiple className="hidden" onChange={handleFiles} disabled={!activeConversation || sendingMessage} />
              </label>

              <button
                type="button"
                onClick={sendMessage}
                disabled={!activeConversation || sendingMessage}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingMessage ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {sendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default MessagePage;
