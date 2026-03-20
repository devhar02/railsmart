import { runSearchAgent } from "./searchAgent.js";
import { runBookingAgent } from "./bookingAgent.js";
import { runPaymentAgent, simulatePaymentVerification } from "./paymentAgent.js";
import { runEmailAgent } from "./emailAgent.js";

export async function orchestrateSearch(params) {
  console.log("[Orchestrator] → SearchAgent");
  const result = await runSearchAgent(params);
  console.log(`[Orchestrator] SearchAgent done. Trains found: ${result.trains?.length ?? 0}`);
  return result;
}

export async function orchestrateBooking(params) {
  console.log("[Orchestrator] → BookingAgent");
  const result = await runBookingAgent(params);
  console.log(`[Orchestrator] BookingAgent done. PNR: ${result.booking?.pnr}`);
  return result;
}

export async function orchestratePayment(params) {
  console.log("[Orchestrator] → PaymentAgent");
  const result = await runPaymentAgent(params);
  console.log(`[Orchestrator] PaymentAgent done.`);
  return result;
}

export async function orchestratePaymentVerification(bookingId, booking, payment, recipientEmail) {
  console.log("[Orchestrator] → Verifying payment...");
  const verification = await simulatePaymentVerification(bookingId);

  if (verification.success) {
    console.log("[Orchestrator] → EmailAgent");
    const emailResult = await runEmailAgent({
      booking: { ...booking, transactionId: verification.transactionId },
      payment: verification,
      recipientEmail,
    });
    console.log(`[Orchestrator] EmailAgent done.`);
    return { verification, emailResult };
  }

  return { verification, emailResult: null };
}
