import { useLocation, useNavigate } from "react-router-dom";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking, payment, emailResult, contactEmail } = state || {};

  if (!booking) return <div className="text-center p-20 text-[var(--muted)]"><button className="text-[var(--accent)]" onClick={() => navigate("/")}>Start over</button></div>;

  const { pnr, bookingId, train, passengers, travelClass, seatNumbers, totalFare } = booking;

  return (
    <div className="rail-bg min-h-screen relative">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Success banner */}
        <div className="text-center mb-8 slide-in">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="font-display text-4xl tracking-widest text-green-400 mb-1">BOOKING CONFIRMED</h1>
          <p className="text-[var(--muted)]">All 4 agents completed successfully</p>
        </div>

        {/* Agent completion */}
        <div className="grid grid-cols-4 gap-2 mb-6 slide-in">
          {[
            { icon: "🔍", label: "Search", done: true },
            { icon: "🎫", label: "Booking", done: true },
            { icon: "💳", label: "Payment", done: true },
            { icon: "📧", label: "Email", done: emailResult?.emailSent },
          ].map((a) => (
            <div key={a.label} className={`card p-3 text-center ${a.done ? "border-green-500/30" : "border-yellow-500/30"}`}>
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-medium">{a.label}</div>
              <div className={`text-xs mt-1 ${a.done ? "text-green-400" : "text-yellow-400"}`}>{a.done ? "✓ Done" : "⚠ Partial"}</div>
            </div>
          ))}
        </div>

        {/* Ticket card */}
        <div className="card p-6 mb-4 slide-in" style={{ borderLeft: "4px solid var(--accent)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-display text-2xl tracking-widest text-[var(--accent)]">RAILSMART</div>
              <div className="text-xs text-[var(--muted)]">e-Ticket / Booking Confirmation</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--muted)]">PNR</div>
              <div className="font-mono text-xl font-bold text-[var(--text)]">{pnr}</div>
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Journey details */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold">{train.depTime}</div>
              <div className="text-xs text-[var(--muted)]">{train.fromName}</div>
              <div className="text-xs text-[var(--muted)]">{train.date}</div>
            </div>
            <div className="flex-1 text-center px-4">
              <div className="text-xs text-[var(--muted)] mb-1">{train.duration}</div>
              <div className="h-px bg-[var(--border)] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)] text-sm">🚂</div>
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">{train.trainName}</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold">{train.arrTime}</div>
              <div className="text-xs text-[var(--muted)]">{train.toName}</div>
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Passengers */}
          <div className="mb-4">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Passengers · {travelClass}</div>
            <div className="space-y-2">
              {passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-[var(--surface2)] rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--muted)]">{i + 1}.</span>
                    <span>{p.name}</span>
                    <span className="text-[var(--muted)] text-xs">Age {p.age} · {p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Other"}</span>
                  </div>
                  <span className="font-mono text-xs text-[var(--accent)]">{seatNumbers?.[i] || "TBD"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Payment info */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-[var(--muted)] text-xs">Transaction ID</div>
              <div className="font-mono text-xs">{payment?.transactionId || "DEMO-TXN"}</div>
            </div>
            <div className="text-right">
              <div className="text-[var(--muted)] text-xs">Amount Paid</div>
              <div className="text-[var(--accent)] text-xl font-bold">₹{totalFare}</div>
            </div>
          </div>
        </div>

        {/* Email status */}
        <div className={`card p-4 mb-6 flex items-center gap-3 ${emailResult?.emailSent ? "border-green-500/30" : "border-yellow-500/30"}`}>
          <span className="text-2xl">📧</span>
          <div>
            <div className="text-sm font-medium">
              {emailResult?.emailSent ? "Confirmation email sent!" : "Email confirmation queued"}
            </div>
            <div className="text-xs text-[var(--muted)]">{contactEmail}</div>
          </div>
          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${emailResult?.emailSent ? "badge-avl" : "badge-rac"}`}>
            {emailResult?.emailSent ? "Sent ✓" : "Pending"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={() => window.print()}>🖨 Print Ticket</button>
          <button className="btn-ghost flex-1" onClick={() => navigate("/")}>Book Another</button>
        </div>
      </div>
    </div>
  );
}
