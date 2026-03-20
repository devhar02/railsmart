# 🚂 RailSmart — Train Ticket Booking (No API Key Required)

A multi-agent web app for booking Indian train tickets.
**Zero external AI dependencies** — runs entirely on your machine.

## Architecture

```
Frontend (React + Vite)          Backend (Node.js + Express)
┌─────────────────────┐          ┌──────────────────────────────┐
│  Search Screen      │          │  Orchestrator                │
│  Results Screen     │ ──────►  │   ├── SearchAgent  (JS)      │
│  Booking Screen     │          │   ├── BookingAgent (JS)      │
│  Payment Screen     │          │   ├── PaymentAgent (QR code) │
│  Confirmation       │          │   └── EmailAgent  (Gmail)    │
└─────────────────────┘          └──────────────────────────────┘
```

---

## Setup (Windows)

### Prerequisites
- Node.js 18+ → https://nodejs.org

---

### Step 1 — Backend

```cmd
cd railsmart\backend
npm install
copy .env.example .env
notepad .env
```

In the `.env` file, fill in your Gmail details (see Gmail setup below), then save and close.

```cmd
npm run dev
```

You should see:
```
RailSmart Backend API — Running on port 3001
```

---

### Step 2 — Frontend (new terminal window)

```cmd
cd railsmart\frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## Gmail Setup (for confirmation emails)

The email agent uses your Gmail to send booking confirmations.
You need a Gmail App Password (not your regular password).

### How to get a Gmail App Password:

1. Go to your Google Account → https://myaccount.google.com
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** (required)
4. Go back to Security, scroll down to **App passwords**
5. Select app: Mail → Select device: Windows Computer
6. Click **Generate** → Copy the 16-character password shown

### Put these in your .env file:

```env
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Note: Email is optional. If you skip the Gmail setup, bookings still work fine.

---

## Booking Flow

```
1. Search      → Enter stations + date → SearchAgent finds trains
2. Select      → Pick train + class from results
3. Passengers  → Fill details → BookingAgent validates & assigns seats
4. Payment     → Scan UPI QR with GPay / PhonePe / Paytm
5. Confirm     → PaymentAgent verifies → EmailAgent sends confirmation
```

---

## Convert to Android APK (later)

```cmd
cd railsmart\frontend
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init RailSmart com.railsmart.app --web-dir dist
npx cap add android
npx cap copy android
npx cap open android
```
Then in Android Studio: Build → Generate Signed Bundle / APK

---

## What is real vs simulated

| Feature | Status |
|---|---|
| Train search | Mock data (realistic) |
| Seat booking | Simulated with real PNR format |
| UPI QR code | Real UPI URI — scannable by any UPI app |
| Payment confirmation | Simulated (no real money moves) |
| Email confirmation | Real Gmail email |
