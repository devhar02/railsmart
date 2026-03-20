import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CLASS_LABELS = { "1A": "First AC", "2A": "Second AC", "3A": "Third AC", SL: "Sleeper", CC: "Chair Car", "2S": "Second Seating" };

function AvailBadge({ status, available, waitlist }) {
  if (status === "AVL") return <span className="badge-avl text-xs px-2 py-0.5 rounded-full">AVL {available}</span>;
  if (status === "RAC") return <span className="badge-rac text-xs px-2 py-0.5 rounded-full">RAC {available}</span>;
  return <span className="badge-wl text-xs px-2 py-0.5 rounded-full">WL {waitlist}</span>;
}

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { result, searchParams } = state || {};
  const [selected, setSelected] = useState(null); // { train, travelClass }

  if (!result) return <div className="text-center p-20 text-[var(--muted)]">No results. <button className="text-[var(--accent)]" onClick={() => navigate("/")}>Go back</button></div>;

  const { trains, from, to, summary } = result;

  function handleSelect(train, cls) {
    setSelected({ train, travelClass: cls });
  }

  function handleContinue() {
    if (!selected) return;
    navigate("/book", { state: { ...selected, searchParams } });
  }

  return (
    <div className="rail-bg min-h-screen relative">
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button className="text-[var(--muted)] text-sm hover:text-[var(--accent)] mb-2 flex items-center gap-1" onClick={() => navigate("/")}>
              ← Back to search
            </button>
            <h1 className="font-display text-3xl tracking-widest text-[var(--accent)]">
              {from?.name} → {to?.name}
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1">{searchParams?.date} · {trains.length} trains found</p>
          </div>
        </div>

        {/* AI summary */}
        {summary && (
          <div className="card p-3 mb-4 border-l-2 border-[var(--accent)] flex items-start gap-2">
            <span>🤖</span>
            <p className="text-sm text-[var(--muted)]"><span className="text-[var(--text)] font-medium">Search Agent: </span>{summary}</p>
          </div>
        )}

        {/* Selected summary bar */}
        {selected && (
          <div className="glass rounded-xl p-4 mb-4 flex items-center justify-between slide-in sticky top-4 z-20">
            <div className="text-sm">
              <span className="text-[var(--accent)] font-semibold">{selected.train.trainName}</span>
              <span className="text-[var(--muted)] ml-2">{CLASS_LABELS[selected.travelClass]} · ₹{selected.train.classes[selected.travelClass].fare}</span>
            </div>
            <button className="btn-primary py-2 px-5 text-sm" onClick={handleContinue}>
              Book Now →
            </button>
          </div>
        )}

        {/* Train list */}
        <div className="space-y-3">
          {trains.map((train) => (
            <div key={train.trainNo} className={`card card-hover p-4 slide-in transition-all ${selected?.train.trainNo === train.trainNo ? "border-[var(--accent)]" : ""}`}>
              {/* Train header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">{train.trainName}</span>
                    {train.pantry && <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">🍽 Pantry</span>}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">Runs: {train.runsOn.join(", ")}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 text-sm font-mono">
                    <div>
                      <div className="font-semibold text-[var(--text)]">{train.depTime}</div>
                      <div className="text-xs text-[var(--muted)]">{train.fromName}</div>
                    </div>
                    <div className="text-center text-[var(--muted)]">
                      <div className="text-xs">{train.duration}</div>
                      <div className="text-lg">→</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[var(--text)]">{train.arrTime}</div>
                      <div className="text-xs text-[var(--muted)]">{train.toName}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class options */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(train.classes).map(([cls, data]) => (
                  <button
                    key={cls}
                    onClick={() => handleSelect(train, cls)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                      selected?.train.trainNo === train.trainNo && selected?.travelClass === cls
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <span className="font-semibold">{cls}</span>
                    <span className="text-[var(--muted)]">₹{data.fare}</span>
                    <AvailBadge {...data} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
