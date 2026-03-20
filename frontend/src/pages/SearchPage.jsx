import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AgentStatus from "../components/AgentStatus";

const CLASS_OPTIONS = [
  { value: "1A", label: "1A — First AC" },
  { value: "2A", label: "2A — Second AC" },
  { value: "3A", label: "3A — Third AC" },
  { value: "SL", label: "SL — Sleeper" },
  { value: "CC", label: "CC — Chair Car" },
  { value: "2S", label: "2S — Second Seating" },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    from: "NDLS", to: "SBC",
    date: new Date().toISOString().split("T")[0],
    travelClass: "",
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);

  useEffect(() => {
    api.getStations().then((d) => setStations(d.stations || []));
  }, []);

  const addLog = (agent, message, type = "info") =>
    setLogs((prev) => [...prev, { agent, message, type }]);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setActiveAgent("SearchAgent");
    addLog("Orchestrator", "Initiating train search...");
    addLog("SearchAgent", `Searching ${form.from} → ${form.to} on ${form.date}`);

    try {
      const result = await api.searchTrains(form);
      addLog("SearchAgent", `Found ${result.trains.length} trains. ${result.summary}`, "success");
      setActiveAgent(null);
      navigate("/results", { state: { result, searchParams: form } });
    } catch (err) {
      addLog("SearchAgent", `Error: ${err.message}`, "error");
      setActiveAgent(null);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rail-bg min-h-screen relative">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-6xl tracking-widest text-[var(--accent)] mb-1">RAILSMART</h1>
          <p className="text-[var(--muted)] text-sm tracking-wider">AI-POWERED TRAIN TICKET BOOKING</p>
        </div>

        {/* Search card */}
        <div className="card p-6 mb-6 slide-in">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            🔍 <span>Find Trains</span>
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">From</label>
                <select className="input-field" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                  {stations.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">To</label>
                <select className="input-field" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
                  {stations.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Date</label>
                <input type="date" className="input-field" min={today} value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Class (optional)</label>
                <select className="input-field" value={form.travelClass} onChange={(e) => setForm({ ...form, travelClass: e.target.value })}>
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching trains...
                </span>
              ) : "Search Trains →"}
            </button>
          </form>
        </div>

        {/* Agent status */}
        {logs.length > 0 && <AgentStatus logs={logs} activeAgent={activeAgent} />}

        {/* Info */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          {[
            { icon: "🤖", label: "AI Agents", desc: "4 specialized agents" },
            { icon: "💳", label: "UPI Payment", desc: "GPay, PhonePe, Paytm" },
            { icon: "📧", label: "Email Confirm", desc: "Instant via Gmail" },
          ].map((f) => (
            <div key={f.label} className="card p-3">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-semibold">{f.label}</div>
              <div className="text-xs text-[var(--muted)]">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
