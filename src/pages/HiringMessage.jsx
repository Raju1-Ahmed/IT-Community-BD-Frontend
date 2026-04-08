import { useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, Paperclip, Send } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

const HiringMessage = () => {
  const { id } = useParams();
  const location = useLocation();
  const candidateName = location.state?.candidateName || "Candidate";
  const candidateRole = location.state?.candidateRole || "Professional";

  const personList = useMemo(
    () => [
      { id: "candidate-main", name: candidateName, role: candidateRole, status: "Active discussion" },
      { id: "candidate-files", name: `${candidateName} Files`, role: "Shared attachments thread", status: "File handoff ready" }
    ],
    [candidateName, candidateRole]
  );

  const [activePersonId, setActivePersonId] = useState("candidate-main");
  const [chatText, setChatText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([
    { id: "m1", sender: "candidate", text: `Hello, this is ${candidateName}.`, time: "09:15 AM" },
    { id: "m2", sender: "employer", text: "I reviewed your expertise profile and would like to discuss a hiring opportunity.", time: "09:18 AM" },
    { id: "m3", sender: "candidate", text: "Sure, please share the project scope and timeline.", time: "09:20 AM" }
  ]);

  const activePerson = personList.find((item) => item.id === activePersonId) || personList[0];

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const sendMessage = () => {
    if (!chatText.trim() && attachments.length === 0) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "employer",
        text: chatText.trim() || "Shared files",
        attachments: attachments.map((file) => file.name),
        time: "Just now"
      }
    ]);
    setChatText("");
    setAttachments([]);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <MessageSquare size={14} /> Direct Messaging
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{candidateName}</h2>
          <p className="text-sm text-slate-600">{candidateRole}</p>
        </div>

        <Link
          to={`/appoint-expertise/${id}`}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} /> Back to Details
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">People</p>
          <p className="mt-1 text-xs text-slate-500">Choose the active communication thread.</p>

          <div className="mt-4 space-y-2">
            {personList.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setActivePersonId(person.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  activePersonId === person.id
                    ? "border-emerald-300 bg-emerald-50 text-slate-900"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="mt-1 text-xs opacity-80">{person.role}</p>
                  </div>
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${activePersonId === person.id ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] opacity-70">{person.status}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">{activePerson.name}</p>
            <p className="mt-1 text-xs text-slate-500">{activePerson.role}</p>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  item.sender === "employer"
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
              className="h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none"
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
        </div>
      </div>
    </section>
  );
};

export default HiringMessage;
