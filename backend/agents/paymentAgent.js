import QRCode from "qrcode";

const MERCHANT_UPI = "railsmart@upi";
const MERCHANT_NAME = "RailSmart Tickets";

export async function runPaymentAgent({ booking, amount }) {
  const { pnr, bookingId } = booking;

  const upiParams = new URLSearchParams({
    pa: MERCHANT_UPI,
    pn: MERCHANT_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Train ticket PNR ${pnr}`,
    tr: bookingId,
  });

  const upiUri = `upi://pay?${upiParams.toString()}`;

  const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
    width: 300,
    margin: 2,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  return {
    success: true,
    agent: "PaymentAgent",
    payment: {
      upiUri,
      qrCode: qrCodeBase64,
      amount,
      currency: "INR",
      merchantUpi: MERCHANT_UPI,
      merchantName: MERCHANT_NAME,
      bookingId,
      pnr,
      deepLinks: {
        gpay: `gpay://upi/pay?${upiParams.toString()}`,
        phonepe: `phonepe://pay?${upiParams.toString()}`,
        paytm: `paytmmp://pay?${upiParams.toString()}`,
      },
      instructions: `Scan the QR code or tap an app below to pay ₹${amount} for PNR ${pnr}.`,
      expiresIn: 600,
    },
  };
}

export async function simulatePaymentVerification(bookingId) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
    bookingId,
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
  };
}
