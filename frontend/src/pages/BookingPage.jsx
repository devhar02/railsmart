import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AgentStatus from "../components/AgentStatus";

const CLASS_LABELS = { "1A": "First AC", "2A": "Second AC", "3A": "Third AC", SL: "Sleeper", CC: "Chair Car", "2S": "Second Seating" };

const emptyPassenger = () => ({ name: "", age: "", gender: "M" });

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { train, travelClass } = state || {};

  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);

  if (!train) return <div className="text-center p-20 text-[var(--muted)]">Invalid booking. <button className="text-[var(--accent)]" onClick={() => navigate("/")}>Start over</button></div>;

  const classData = train.classes[travelClass];
  const totalFare = classData.fare * passengers.length;

  const addLog = (agent, message, type = "info") =>
    setLogs((prev) => [...prev, { agent, message, type }]);

  function updatePassenger(i, field, value) {
    setPassengers((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function addPassenger() {
    if (passengers.length < 6) setPassengers((prev) => [...prev, emptyPassenger()]);
  }

  function removePassenger(i) {
    if (passengers.length > 1) setPassengers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleBook(e) {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setActiveAgent("BookingAgent");

    addLog("Orchestrator", "Handing off to BookingAgent...");
    addLog("BookingAgent", `Validating ${passengers.length} passenger(s)...`);

    try {
      const result = await api.bookTicket({ train, passengers, contactEmail: contact.email, contactPhone: contact.phone, travelClass });

      if (!result.success) {
        result.errors?.forEach((err) => addLog("BookingAgent", err, "error"));
        setActiveAgent(null);
        setLoading(false);
        return;
      }

      addLog("BookingAgent", `Booking confirmed! PNR: ${result.booking.pnr}`, "success");
      addLog("Orchestrator", "Handing off to PaymentAgent...");
      setActiveAgent("PaymentAgent");

      const payResult = await api.initiatePayment({ booking: result.booking, amount: totalFare });
      addLog("PaymentAgent", `UPI payment request generated for ₹${totalFare}`, "success");
      setActiveAgent(null);

      navigate("/payment", {
        state: { booking: result.booking, payment: payResult.payment, contactEmail: contact.email },
      });
    } catch (err) {
      addLog("BookingAgent", `Error: ${err.message}`, "error");
      setActiveAgent(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rail-bg min-h-screen relative">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <button className="text-[var(--muted)] text-sm hover:text-[var(--accent)] mb-4 flex items-center gap-1" onClick={() => navigate(-1)}>
          ← Back to results
        </button>

        <h1 className="font-display text-3xl tracking-widest text-[var(--accent)] mb-1">PASSENGER DETAILS</h1>
        <p className="text-[var(--muted)] text-sm mb-6">{train.trainName} · {CLASS_LABELS[travelClass]} · {train.date}</p>

        {/* Journey summary */}
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div className="font-mono text-sm">
            <div className="text-[var(--text)] font-semibold">{train.depTime} → {train.arrTime}</div>
            <div className="text-[var(--muted)] text-xs">{train.fromName} → {train.toName} · {train.duration}</div>
          </div>
          <div className="text-right">
            <div className="text-[var(--accent)] font-semibold">₹{classData.fare} <span className="text-[var(--muted)] text-xs font-normal">/ person</span></div>
            <div className="text-xs text-[var(--muted)]">Total: ₹{totalFare}</div>
          </div>
        </div>

        <form onSubmit={handleBook} className="space-y-5">
          {/* Passengers */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">🧑‍🤝‍🧑 Passengers</h2>
              {passengers.length < 6 && (
                <button type="button" onClick={addPassenger} className="text-xs text-[var(--accent)] hover:underline">+ Add passenger</button>
              )}
            </div>

            <div className="space-y-4">
              {passengers.map((p, i) => (
                <div key={i} className="bg-[var(--surface2)] rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--muted)] uppercase tracking-wider">Passenger {i + 1}</span>
                    {passengers.length > 1 && (
                      <button type="button" onClick={() => removePassenger(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <input className="input-field" placeholder="Full name" required value={p.name}
                        onChange={(e) => updatePassenger(i, "name", e.target.value)} />
                    </div>
                    <div>
                      <input className="input-field" placeholder="Age" type="number" min="1" max="120" required value={p.age}
                        onChange={(e) => updatePassenger(i, "age", e.target.value)} />
                    </div>
                    <div>
                      <select className="input-field" value={p.gender} onChange={(e) => updatePassenger(i, "gender", e.target.value)}>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="T">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">📬 Contact Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Email (for confirmation)</label>
                <input className="input-field" type="email" placeholder="you@email.com" required value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Phone</label>
                <input className="input-field" type="tel" placeholder="10-digit mobile number" required pattern="[0-9]{10}"
                  value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Fare summary */}
          <div className="card p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--muted)]">Fare ({passengers.length} × ₹{classData.fare})</span>
              <span>₹{totalFare}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--muted)]">Convenience fee</span>
              <span>₹0</span>
            </div>
            <div className="border-t border-[var(--border)] my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-[var(--accent)]">₹{totalFare}</span>
            </div>
          </div>

          {logs.length > 0 && <AgentStatus logs={logs} activeAgent={activeAgent} />}

          <button type="submit" className="btn-primary w-full text-base" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing booking...
              </span>
            ) : `Proceed to Payment ₹${totalFare} →`}
          </button>
        </form>
      </div>
    </div>
  );
}
