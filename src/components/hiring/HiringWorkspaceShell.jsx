import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Sparkles, UserPlus } from "lucide-react";

const actions = [
  {
    key: "message",
    label: "Message",
    hint: "Conversation history and file sharing",
    icon: MessageSquare,
    to: (id) => `/messages/${id}`,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  {
    key: "invite",
    label: "Invite for Hire",
    hint: "Structured hiring proposal",
    icon: UserPlus,
    to: (id) => `/hire-invite/${id}`,
    tone: "border-cyan-200 bg-cyan-50 text-cyan-700"
  },
  {
    key: "mail",
    label: "Direct Mail",
    hint: "Formal outreach email",
    icon: Mail,
    to: (id) => `/direct-mail/${id}`,
    tone: "border-amber-200 bg-amber-50 text-amber-700"
  }
];

const HiringWorkspaceShell = ({ activeKey, candidateName, candidateRole, children, showActions = true }) => {
  const { id } = useParams();

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
        {showActions ? (
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Communication Actions</p>
              <p className="mt-1 text-xs text-slate-500">Choose the hiring action you want to continue with.</p>

              <div className="mt-4 space-y-2">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const active = action.key === activeKey;
                  return (
                    <Link
                      key={action.key}
                      to={action.to(id)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`rounded-xl border px-2.5 py-2 ${active ? "border-white/20 bg-white/10 text-white" : action.tone}`}>
                          <Icon size={16} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{action.label}</span>
                          <span className="block text-xs opacity-75">{action.hint}</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Workspace Note</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This workspace is prepared for real hiring communication flow. Messaging history, invite draft, and direct mail are separated so employers can act clearly.
              </p>
            </div>
          </aside>
        ) : null}

        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
};

export default HiringWorkspaceShell;
