import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import HiringWorkspaceShell from "../components/hiring/HiringWorkspaceShell";

const HiringDirectMail = () => {
  const location = useLocation();
  const candidateName = location.state?.candidateName || "Candidate";
  const candidateRole = location.state?.candidateRole || "Professional";
  const candidateEmail = location.state?.candidateEmail || "";
  const [mailDraft, setMailDraft] = useState({
    subject: `Hiring discussion with ${candidateName}`,
    body: `Hello ${candidateName},\n\nI would like to discuss a hiring opportunity with you.\n\nRegards`
  });
  const gmailComposeUrl = useMemo(() => {
    if (!candidateEmail) return "";
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: candidateEmail,
      su: mailDraft.subject,
      body: mailDraft.body
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [candidateEmail, mailDraft.body, mailDraft.subject]);

  useEffect(() => {
    if (!gmailComposeUrl) return;
    const popup = window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = gmailComposeUrl;
    }
  }, [gmailComposeUrl]);

  return (
    <HiringWorkspaceShell activeKey="mail" candidateName={candidateName} candidateRole={candidateRole}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-amber-700">
            <Mail size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Direct Mail</p>
            <p className="text-xs text-slate-500">Prepare a formal outreach email for this candidate.</p>
          </div>
        </div>
      </div>

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
            className="h-44 rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Write the email body"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{candidateEmail || "No direct email found for this candidate."}</p>
            <a
            href={gmailComposeUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              candidateEmail ? "bg-amber-500 text-white hover:bg-amber-600" : "pointer-events-none bg-slate-200 text-slate-400"
            }`}
          >
            Open Gmail
          </a>
        </div>
      </div>
    </HiringWorkspaceShell>
  );
};

export default HiringDirectMail;
