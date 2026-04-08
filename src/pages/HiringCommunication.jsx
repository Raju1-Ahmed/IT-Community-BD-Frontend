import { useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Paperclip, Send, Sparkles, UserPlus } from "lucide-react";

const modeConfig = {
  message: {
    title: "Message",
    icon: MessageSquare,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  invite: {
    title: "Invite for Hire",
    icon: UserPlus,
    tone: "border-cyan-200 bg-cyan-50 text-cyan-700"
  },
  mail: {
    title: "Direct Mail",
    icon: Mail,
    tone: "border-amber-200 bg-amber-50 text-amber-700"
  }
};

const chipClass = (active) =>
  active
    ? "border-slate-900 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

const HiringCommunication = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMode = modeConfig[searchParams.get("mode")] ? searchParams.get("mode") : "message";
  const candidateName = location.state?.candidateName || "Candidate";
  const candidateRole = location.state?.candidateRole || "Professional";
  const candidateEmail = location.state?.candidateEmail || "";

  const [chatText, setChatText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "system-1",
      sender: "system",
      text: `You opened a hiring communication workspace for ${candidateName}.`,
      time: "Now"
    }
  ]);

  const [inviteForm, setInviteForm] = useState({
    title: "",
    budget: "",
    startDate: "",
    timeline: "",
    note: ""
  });
  const [inviteStatus, setInviteStatus] = useState("");
  const [mailDraft, setMailDraft] = useState({
    subject: `Hiring discussion with ${candidateName}`,
    body: `Hello ${candidateName},\n\nI would like to discuss a hiring opportunity with you.\n\nRegards`
  });

  const currentMode = useMemo(() => modeConfig[activeMode], [activeMode]);
  const CurrentModeIcon = currentMode.icon;

  const openMode = (mode) => setSearchParams({ mode });

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const sendMessage = () => {
    if (!chatText.trim() && attachments.length === 0) return;
    const attachmentNames = attachments.map((file) => file.name);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        sender: "employer",
        text: chatText.trim() || "Shared files",
        attachments: attachmentNames,
        time: "Just now"
      }
    ]);
    setChatText("");
    setAttachments([]);
  };

  const submitInvite = () => {
    if (!inviteForm.title.trim()) return;
    setInviteStatus("Invite draft prepared. You can confirm backend delivery next.");
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles size={14} /> Hiring Communication Flow
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

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Communication Actions</p>
            <p className="mt-1 text-xs text-slate-500">Choose how you want to start the hiring conversation.</p>

            <div className="mt-4 space-y-2">
              {Object.entries(modeConfig).map(([mode, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => openMode(mode)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${chipClass(
                      activeMode === mode
                    )}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`rounded-xl border px-2.5 py-2 ${config.tone}`}>
                        <Icon size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{config.title}</span>
                        <span className="block text-xs opacity-75">
                          {mode === "message"
                            ? "Real-time conversation and file sharing"
                            : mode === "invite"
                              ? "Structured hiring proposal"
                              : "Formal email outreach"}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Workspace Note</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This workspace is ready for message flow, invite flow, and direct mail flow. File selection is already supported in the message composer.
            </p>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-xl border px-2.5 py-2 ${currentMode.tone}`}>
                <CurrentModeIcon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentMode.title}</p>
                <p className="text-xs text-slate-500">
                  {activeMode === "message"
                    ? "Use this area to send a direct message and share files."
                    : activeMode === "invite"
                      ? "Prepare a structured hiring invite."
                      : "Prepare a formal direct mail draft."}
                </p>
              </div>
            </div>
          </div>

          {activeMode === "message" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="space-y-3">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      item.sender === "employer"
                        ? "ml-auto max-w-[85%] bg-emerald-50 text-slate-800"
                        : "bg-slate-50 text-slate-700"
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

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Write your hiring message here..."
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
                    <Send size={15} /> Send Message
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeMode === "invite" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={inviteForm.title}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Hiring title or project name"
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                />
                <input
                  value={inviteForm.budget}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, budget: e.target.value }))}
                  placeholder="Budget / salary / monthly rate"
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                />
                <input
                  type="date"
                  value={inviteForm.startDate}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                />
                <input
                  value={inviteForm.timeline}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, timeline: e.target.value }))}
                  placeholder="Timeline / contract length"
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                />
                <textarea
                  value={inviteForm.note}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Write the invite details, responsibilities, and expectations"
                  className="h-32 rounded-xl border border-slate-200 p-3 text-sm md:col-span-2"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Structured invite draft for {candidateName}</p>
                <button
                  type="button"
                  onClick={submitInvite}
                  className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  Prepare Invite
                </button>
              </div>

              {inviteStatus ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{inviteStatus}</p> : null}
            </div>
          ) : null}

          {activeMode === "mail" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3">
                <input
                  value={mailDraft.subject}
                  onChange={(e) => setMailDraft((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Mail subject"
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                />
                <textarea
                  value={mailDraft.body}
                  onChange={(e) => setMailDraft((prev) => ({ ...prev, body: e.target.value }))}
                  className="h-40 rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Write the email body"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">{candidateEmail || "No direct email found for this candidate."}</p>
                <a
                  href={
                    candidateEmail
                      ? `mailto:${candidateEmail}?subject=${encodeURIComponent(mailDraft.subject)}&body=${encodeURIComponent(mailDraft.body)}`
                      : undefined
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    candidateEmail ? "bg-amber-500 text-white hover:bg-amber-600" : "pointer-events-none bg-slate-200 text-slate-400"
                  }`}
                >
                  Open Mail Draft
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HiringCommunication;
