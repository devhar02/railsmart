import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AgentStatus from "../components/AgentStatus";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { booking, payment, contactEmail } = state || {};

  const [status, setStatus] = useState("pending"); // pending | verifying | success | failed
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [timer, setTimer] = useState(600);

  if (!booking || !payment) return <div className="text-center p-20 text-[var(--muted)]">Invalid payment session. <button className="text-[var(--accent)]" onClick={() => navigate("/")}>Start over</button></div>;

  const addLog = (agent, message, type = "info") =>
    setLogs((prev) => [...prev, { agent, message, type }]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(() => setTimer((p) => p <= 1 ? (clearInterval(t), 0) : p - 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function handleVerifyPayment() {
    setStatus("verifying");
    setActiveAgent("PaymentAgent");
    addLog("PaymentAgent", "Verifying UPI transaction...");

    try {
      const result = await api.verifyPayment({
        bookingId: booking.bookingId,
        booking,
        payment,
        recipientEmail: contactEmail,
      });

      if (result.verification?.success) {
        addLog("PaymentAgent", `Payment verified! TXN: ${result.verification.transactionId}`, "success");
        addLog("Orchestrator", "Payment complete. Handing off to EmailAgent...");
        setActiveAgent("EmailAgent");
        addLog("EmailAgent", `Sending confirmation to ${contactEmail}...`);

        if (result.emailResult?.emailSent) {
          addLog("EmailAgent", `Email sent successfully to ${contactEmail}!`, "success");
        } else {
          addLog("EmailAgent", `Email composed for ${contactEmail}`, "success");
        }

        setActiveAgent(null);
        setStatus("success");

        setTimeout(() => {
          navigate("/confirmation", { state: { booking, payment: result.verification, emailResult: result.emailResult, contactEmail } });
        }, 1500);
      } else {
        addLog("PaymentAgent", "Payment verification failed.", "error");
        setStatus("failed");
        setActiveAgent(null);
      }
    } catch (err) {
      addLog("PaymentAgent", `Error: ${err.message}`, "error");
      setStatus("failed");
      setActiveAgent(null);
    }
  }

  return (
    <div className="rail-bg min-h-screen relative">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <h1 className="font-display text-3xl tracking-widest text-[var(--accent)] mb-1">PAYMENT</h1>
        <p className="text-[var(--muted)] text-sm mb-6">Complete your booking by paying via UPI</p>

        {/* Booking summary */}
        <div className="card p-4 mb-5">
          <div className="flex justify-between text-sm">
            <div>
              <div className="font-semibold">{booking.train?.trainName}</div>
              <div className="text-[var(--muted)] text-xs">{booking.train?.fromName} → {booking.train?.toName} · {booking.train?.date}</div>
              <div className="text-[var(--muted)] text-xs mt-1">PNR: <span className="font-mono text-[var(--text)]">{booking.pnr}</span></div>
            </div>
            <div className="text-right">
              <div className="text-[var(--accent)] text-xl font-semibold">₹{booking.totalFare}</div>
              <div className="text-[var(--muted)] text-xs">{booking.passengers?.length} passenger(s)</div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="card p-6 mb-5 text-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Scan to Pay</span>
            {status === "pending" && (
              <span className={`font-mono text-sm ${timer < 60 ? "text-red-400" : "text-[var(--accent)]"}`}>
                ⏱ {formatTimer(timer)}
              </span>
            )}
          </div>

          {status === "success" ? (
            <div className="py-8">
              <div className="text-6xl mb-3">✅</div>
              <div className="text-green-400 font-semibold">Payment Successful!</div>
              <div className="text-[var(--muted)] text-sm mt-1">Redirecting...</div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <img src={payment.qrCode} alt="UPI QR Code" className="rounded-xl w-56 h-56" />
              </div>
              <div className="text-xs text-[var(--muted)] mb-1">Pay to: <span className="font-mono text-[var(--text)]">{payment.merchantUpi}</span></div>
              <div className="text-xs text-[var(--muted)]">{payment.instructions}</div>
            </>
          )}
        </div>

        {/* UPI app deep links */}
        {status === "pending" && (
          <div className="card p-4 mb-5">
            <p className="text-xs text-[var(--muted)] mb-3 uppercase tracking-wider">Pay with UPI app</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "GPay", link: payment.deepLinks.gpay, emoji: "🟢" },
                { name: "PhonePe", link: payment.deepLinks.phonepe, emoji: "🟣" },
                { name: "Paytm", link: payment.deepLinks.paytm, emoji: "🔵" },
              ].map((app) => (
                <a key={app.name} href={app.link}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all text-sm">
                  <span className="text-2xl">{app.emoji}</span>
                  <span className="text-xs">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Agent logs */}
        {logs.length > 0 && <AgentStatus logs={logs} activeAgent={activeAgent} />}

        {/* Action buttons */}
        {status === "pending" && (
          <button className="btn-primary w-full text-base" onClick={handleVerifyPayment}>
            I've Completed Payment →
          </button>
        )}

        {status === "verifying" && (
          <button className="btn-primary w-full" disabled>
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying & Sending Email...
            </span>
          </button>
        )}

        {status === "failed" && (
          <div className="space-y-2">
            <div className="text-center text-red-400 text-sm mb-2">Payment verification failed. Please try again.</div>
            <button className="btn-primary w-full" onClick={() => setStatus("pending")}>Retry</button>
            <button className="btn-ghost w-full" onClick={() => navigate("/")}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
