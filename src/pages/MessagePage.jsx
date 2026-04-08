import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, Paperclip, Search, Send } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const MessagePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const candidateName = location.state?.candidateName || "Candidate";
  const candidateRole = location.state?.candidateRole || "Professional";

  const personList = useMemo(
    () => [
      {
        id: "candidate-main",
        name: candidateName,
        role: candidateRole,
        status: "Active now",
        preview: "Sure, please share the project scope and timeline.",
        avatar: "",
        unread: 2
      },
      {
        id: "sadia-ui",
        name: "Sadia Rahman",
        role: "UI/UX Designer",
        status: "Online",
        preview: "I can send the updated portfolio and Behance link.",
        avatar: "",
        unread: 0
      },
      {
        id: "nafi-motion",
        name: "Nafi Hasan",
        role: "Motion Graphics Designer",
        status: "Last active 1h ago",
        preview: "The animation draft is ready for your review.",
        avatar: "",
        unread: 1
      }
    ],
    [candidateName, candidateRole]
  );

  const [activePersonId, setActivePersonId] = useState("candidate-main");
  const [chatText, setChatText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [messagesByPerson, setMessagesByPerson] = useState({
    "candidate-main": [
      { id: "m1", sender: "person", text: `Hello, this is ${candidateName}.`, time: "09:15 AM" },
      { id: "m2", sender: "me", text: "I reviewed your expertise profile and would like to discuss a hiring opportunity.", time: "09:18 AM" },
      { id: "m3", sender: "person", text: "Sure, please share the project scope and timeline.", time: "09:20 AM" }
    ],
    "sadia-ui": [
      { id: "m4", sender: "person", text: "Hi, I specialize in product and mobile UI design.", time: "Yesterday" },
      { id: "m5", sender: "me", text: "Please share your latest dashboard case study.", time: "Yesterday" },
      { id: "m6", sender: "person", text: "I can send the updated portfolio and Behance link.", time: "Yesterday" }
    ],
    "nafi-motion": [
      { id: "m7", sender: "me", text: "Can you handle short-form ad edits this week?", time: "11:10 AM" },
      { id: "m8", sender: "person", text: "Yes, the animation draft is ready for your review.", time: "11:22 AM" }
    ]
  });

  useEffect(() => {
    if (id) {
      setActivePersonId("candidate-main");
    }
  }, [id]);

  const filteredPeople = personList.filter((person) =>
    `${person.name} ${person.role} ${person.preview}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const activePerson = filteredPeople.find((item) => item.id === activePersonId) || personList.find((item) => item.id === activePersonId) || personList[0];
  const activeMessages = messagesByPerson[activePerson.id] || [];

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const sendMessage = () => {
    if (!chatText.trim() && attachments.length === 0) return;
    setMessagesByPerson((prev) => ({
      ...prev,
      [activePerson.id]: [
        ...(prev[activePerson.id] || []),
        {
          id: `msg-${Date.now()}`,
          sender: "me",
          text: chatText.trim() || "Shared files",
          attachments: attachments.map((file) => file.name),
          time: "Just now"
        }
      ]
    }));
    setChatText("");
    setAttachments([]);
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

        {id ? (
          <Link
            to={`/appoint-expertise/${id}`}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to Details
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">People</p>
            <p className="mt-1 text-xs text-slate-500">Recent and active conversations</p>
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
            {filteredPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setActivePersonId(person.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  activePersonId === person.id
                    ? "border-emerald-300 bg-emerald-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {getInitials(person.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{person.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{person.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {person.unread ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {person.unread}
                          </span>
                        ) : null}
                        <span className={`h-2.5 w-2.5 rounded-full ${activePersonId === person.id ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-500">{person.preview}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{person.status}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                {getInitials(activePerson.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{activePerson.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {activePerson.role} {user?.name ? `· chatting as ${user.name}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[460px] space-y-3 overflow-y-auto px-4 py-4">
            {activeMessages.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  item.sender === "me"
                    ? "ml-auto max-w-[85%] bg-emerald-50 text-slate-800"
                    : "max-w-[85%] bg-slate-50 text-slate-700"
                }`}
              >
                <p className="whitespace-pre-line">{item.text}</p>
                {item.attachments?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.attachments.map((fileName) => (
                      <span key={fileName} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                        {fileName}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Write your message here..."
              className="h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <span key={`${file.name}-${file.size}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  {file.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Paperclip size={15} /> Share Files
                <input type="file" multiple className="hidden" onChange={handleFiles} />
              </label>

              <button
                type="button"
                onClick={sendMessage}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Send size={15} /> Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default MessagePage;
