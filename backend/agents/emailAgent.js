import nodemailer from "nodemailer";

function buildEmailHtml(booking, transactionId) {
  const { pnr, bookingId, train, passengers, travelClass, seatNumbers, totalFare, contactPhone } = booking;

  const passengerRows = passengers
    .map(
      (p, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">${p.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">${p.age}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">${p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Other"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a3a;color:#ff5f1f;font-family:monospace;">${seatNumbers?.[i] || "TBD"}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;color:#e8e8f0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:36px;letter-spacing:6px;color:#ff5f1f;margin:0;">RAILSMART</h1>
      <p style="color:#6b6b80;font-size:13px;margin:4px 0 0;">e-Ticket Confirmation</p>
    </div>

    <!-- Success banner -->
    <div style="background:#10b981;border-radius:10px;padding:16px 24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:white;">✅ Booking Confirmed!</p>
    </div>

    <!-- PNR Box -->
    <div style="background:#111118;border:2px solid #ff5f1f;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="color:#6b6b80;font-size:11px;letter-spacing:3px;margin:0 0 6px;">YOUR PNR NUMBER</p>
      <p style="color:#ff5f1f;font-size:32px;font-weight:800;font-family:monospace;margin:0;">${pnr}</p>
      <p style="color:#6b6b80;font-size:12px;margin:6px 0 0;">Booking ID: ${bookingId}</p>
    </div>

    <!-- Journey details -->
    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="color:#6b6b80;font-size:11px;letter-spacing:2px;margin:0 0 16px;">JOURNEY DETAILS</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <p style="font-size:24px;font-weight:700;font-family:monospace;margin:0;">${train.depTime}</p>
          <p style="color:#6b6b80;font-size:13px;margin:4px 0 0;">${train.fromName}</p>
        </div>
        <div style="text-align:center;color:#6b6b80;font-size:13px;">
          🚂 ${train.duration}
        </div>
        <div style="text-align:right;">
          <p style="font-size:24px;font-weight:700;font-family:monospace;margin:0;">${train.arrTime}</p>
          <p style="color:#6b6b80;font-size:13px;margin:4px 0 0;">${train.toName}</p>
        </div>
      </div>
      <div style="border-top:1px dashed #2a2a3a;padding-top:12px;display:flex;gap:24px;flex-wrap:wrap;">
        <span style="font-size:13px;"><span style="color:#6b6b80;">Train: </span>${train.trainName}</span>
        <span style="font-size:13px;"><span style="color:#6b6b80;">Date: </span>${train.date}</span>
        <span style="font-size:13px;"><span style="color:#6b6b80;">Class: </span>${travelClass}</span>
      </div>
    </div>

    <!-- Passengers table -->
    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="color:#6b6b80;font-size:11px;letter-spacing:2px;margin:0 0 16px;">PASSENGERS</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="color:#6b6b80;text-align:left;">
            <th style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">#</th>
            <th style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">Name</th>
            <th style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">Age</th>
            <th style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">Gender</th>
            <th style="padding:8px 12px;border-bottom:1px solid #2a2a3a;">Seat</th>
          </tr>
        </thead>
        <tbody>${passengerRows}</tbody>
      </table>
    </div>

    <!-- Payment info -->
    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#6b6b80;font-size:11px;letter-spacing:2px;margin:0 0 12px;">PAYMENT SUMMARY</p>
      <div style="display:flex;justify-content:space-between;">
        <div>
          <p style="color:#6b6b80;font-size:12px;margin:0 0 4px;">Transaction ID</p>
          <p style="font-family:monospace;font-size:13px;margin:0;">${transactionId}</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#6b6b80;font-size:12px;margin:0 0 4px;">Amount Paid</p>
          <p style="color:#ff5f1f;font-size:24px;font-weight:800;margin:0;">₹${totalFare}</p>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div style="background:#1a1a24;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#f59e0b;font-size:12px;font-weight:700;margin:0 0 8px;">✈ TRAVEL TIPS</p>
      <ul style="color:#6b6b80;font-size:12px;margin:0;padding-left:16px;line-height:1.8;">
        <li>Carry a valid government-issued photo ID on the journey.</li>
        <li>Arrive at the station at least 30 minutes before departure.</li>
        <li>Keep this PNR number handy for ticket checking.</li>
        <li>Download the NTES app to track your train live.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#6b6b80;font-size:11px;">
      <p>This is an automated confirmation from RailSmart (demo).</p>
      <p>For support, reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function runEmailAgent({ booking, payment, recipientEmail }) {
  const transactionId = payment?.transactionId || "DEMO-TXN";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"RailSmart Tickets" <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: `🎫 Booking Confirmed! PNR ${booking.pnr} — ${booking.train.fromName} to ${booking.train.toName}`,
    html: buildEmailHtml(booking, transactionId),
  };

  let emailSent = false;
  let errorMsg = null;

  try {
    await transporter.sendMail(mailOptions);
    emailSent = true;
  } catch (err) {
    // Don't crash the whole flow if email fails
    errorMsg = err.message;
    console.error("[EmailAgent] Failed to send email:", err.message);
  }

  return {
    success: true,
    agent: "EmailAgent",
    recipientEmail,
    emailSent,
    message: emailSent
      ? `Confirmation email sent to ${recipientEmail}`
      : `Email skipped (${errorMsg}). Booking is still confirmed.`,
  };
}
