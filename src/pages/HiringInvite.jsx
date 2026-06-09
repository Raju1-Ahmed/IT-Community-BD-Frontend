import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Loader2, MessageSquare, UserPlus } from "lucide-react";
import api from "../api/client";
import HiringWorkspaceShell from "../components/hiring/HiringWorkspaceShell";

const HiringInvite = () => {
  const location = useLocation();
  const { id } = useParams();
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
  const [participantId, setParticipantId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitInvite = async () => {
    if (!inviteForm.title.trim()) {
      setStatus("Hiring title or project name is required.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    setParticipantId("");

    try {
      const { data } = await api.post(
        "/messages/hire-invites",
        {
          expertiseProfileId: id,
          ...inviteForm
        },
        { meta: { skipLoader: true } }
      );

      setParticipantId(data?.conversation?.participant?.id || "");
      setStatus("Hire invite sent to the candidate inbox.");
    } catch (error) {
      setStatus(error?.response?.data?.message || "Failed to send hire invite.");
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {submitting ? "Sending..." : "Prepare Invite"}
          </button>
        </div>

        {status ? (
          <div className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{status}</p>
              {participantId ? (
                <Link
                  to={`/messages/${participantId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100"
                >
                  <MessageSquare size={14} />
                  Open Inbox
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </HiringWorkspaceShell>
  );
};

export default HiringInvite;
