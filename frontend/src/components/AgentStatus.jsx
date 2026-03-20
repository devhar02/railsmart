export default function AgentStatus({ logs = [], activeAgent = null }) {
  const agents = [
    { id: "SearchAgent", label: "Search", icon: "🔍" },
    { id: "BookingAgent", label: "Booking", icon: "🎫" },
    { id: "PaymentAgent", label: "Payment", icon: "💳" },
    { id: "EmailAgent", label: "Email", icon: "📧" },
  ];

  const completedAgents = logs.map((l) => l.agent).filter(Boolean);

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-[var(--muted)] uppercase tracking-widest font-mono">Agent Orchestrator</span>
        {activeAgent && (
          <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse inline-block" />
            Running
          </span>
        )}
      </div>

      {/* Agent pipeline */}
      <div className="flex items-center gap-2 mb-3">
        {agents.map((agent, i) => {
          const done = completedAgents.includes(agent.id);
          const active = activeAgent === agent.id;
          return (
            <div key={agent.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                active ? "bg-[var(--accent)] text-white" :
                done ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                "bg-[var(--surface2)] text-[var(--muted)]"
              }`}>
                <span>{agent.icon}</span>
                <span>{agent.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white pulse inline-block" />}
                {done && <span className="text-green-400">✓</span>}
              </div>
              {i < agents.length - 1 && (
                <span className={`text-xs transition-colors duration-500 ${done ? "text-green-400" : "text-[var(--border)]"}`}>→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Log output */}
      {logs.length > 0 && (
        <div className="agent-log">
          {logs.map((log, i) => (
            <div key={i} className={`mb-0.5 ${log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-[var(--muted)]"}`}>
              <span className="text-[var(--accent)]">[{log.agent || "Orchestrator"}]</span>{" "}
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
