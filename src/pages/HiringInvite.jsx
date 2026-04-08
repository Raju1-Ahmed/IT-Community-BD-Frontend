import { useState } from "react";
import { useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";
import HiringWorkspaceShell from "../components/hiring/HiringWorkspaceShell";

const HiringInvite = () => {
  const location = useLocation();
  const candidateName = location.state?.candidateName || "Candidate";
  const candidateRole = location.state?.candidateRole || "Professional";
  const [inviteForm, setInviteForm] = useState({
    title: "",
    budget: "",
    startDate: "",
    timeline: "",
    note: ""
  });
  const [status, setStatus] = useState("");

  const submitInvite = () => {
    if (!inviteForm.title.trim()) return;
    setStatus("Invite draft prepared. Backend delivery can be connected next.");
  };

  return (
    <HiringWorkspaceShell activeKey="invite" candidateName={candidateName} candidateRole={candidateRole} showActions={false}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-2 text-cyan-700">
            <UserPlus size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Invite for Hire</p>
            <p className="text-xs text-slate-500">Create a structured hiring proposal for this candidate.</p>
          </div>
        </div>
      </div>

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
            placeholder="Write scope, responsibilities, milestones, and expectations"
            className="h-36 rounded-xl border border-slate-200 p-3 text-sm md:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Structured hire invitation for {candidateName}</p>
          <button
            type="button"
            onClick={submitInvite}
            className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Prepare Invite
          </button>
        </div>

        {status ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{status}</p> : null}
      </div>
    </HiringWorkspaceShell>
  );
};

export default HiringInvite;
