import express from "express";
import {
  orchestrateSearch,
  orchestrateBooking,
  orchestratePayment,
  orchestratePaymentVerification,
} from "../agents/orchestrator.js";
import { STATIONS } from "../agents/mockData.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "RailSmart API", agents: ["SearchAgent", "BookingAgent", "PaymentAgent", "EmailAgent"] });
});

// Get all stations
router.get("/stations", (req, res) => {
  res.json({ success: true, stations: STATIONS });
});

// Search trains
router.post("/search", async (req, res) => {
  try {
    const { from, to, date, travelClass } = req.body;
    if (!from || !to || !date) {
      return res.status(400).json({ success: false, error: "from, to, and date are required" });
    }
    const result = await orchestrateSearch({ from, to, date, travelClass });
    res.json(result);
  } catch (err) {
    console.error("[/search] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create booking
router.post("/book", async (req, res) => {
  try {
    const { train, passengers, contactEmail, contactPhone, travelClass } = req.body;
    if (!train || !passengers || !contactEmail || !travelClass) {
      return res.status(400).json({ success: false, error: "Missing required booking fields" });
    }
    const result = await orchestrateBooking({ train, passengers, contactEmail, contactPhone, travelClass });
    res.json(result);
  } catch (err) {
    console.error("[/book] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate UPI payment
router.post("/payment/initiate", async (req, res) => {
  try {
    const { booking, amount } = req.body;
    if (!booking || !amount) {
      return res.status(400).json({ success: false, error: "booking and amount are required" });
    }
    const result = await orchestratePayment({ booking, amount });
    res.json(result);
  } catch (err) {
    console.error("[/payment/initiate] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify payment + send email
router.post("/payment/verify", async (req, res) => {
  try {
    const { bookingId, booking, payment, recipientEmail } = req.body;
    if (!bookingId || !booking || !recipientEmail) {
      return res.status(400).json({ success: false, error: "bookingId, booking, and recipientEmail are required" });
    }
    const result = await orchestratePaymentVerification(bookingId, booking, payment, recipientEmail);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("[/payment/verify] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
