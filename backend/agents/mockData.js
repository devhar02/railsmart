// Mock train database for demo purposes
export const STATIONS = [
  { code: "NDLS", name: "New Delhi" },
  { code: "MMCT", name: "Mumbai Central" },
  { code: "MAS", name: "Chennai Central" },
  { code: "HWH", name: "Howrah Junction" },
  { code: "SBC", name: "Bengaluru City" },
  { code: "HYB", name: "Hyderabad Deccan" },
  { code: "ADI", name: "Ahmedabad Junction" },
  { code: "PUNE", name: "Pune Junction" },
  { code: "JP", name: "Jaipur Junction" },
  { code: "LKO", name: "Lucknow Charbagh" },
  { code: "PNBE", name: "Patna Junction" },
  { code: "BPL", name: "Bhopal Junction" },
  { code: "NGP", name: "Nagpur Junction" },
  { code: "UDZ", name: "Udaipur City" },
  { code: "GHY", name: "Guwahati" },
];

const TRAIN_TEMPLATES = [
  { name: "Rajdhani Express", type: "RAJDHANI", speed: "fast" },
  { name: "Shatabdi Express", type: "SHATABDI", speed: "fast" },
  { name: "Duronto Express", type: "DURONTO", speed: "fast" },
  { name: "Vande Bharat Express", type: "VANDEBHARAT", speed: "superfast" },
  { name: "Garib Rath Express", type: "GARIBRATH", speed: "medium" },
  { name: "Superfast Express", type: "SF", speed: "medium" },
  { name: "Mail Express", type: "MAIL", speed: "slow" },
];

const CLASSES = {
  fast: ["1A", "2A", "3A"],
  superfast: ["CC", "EC", "2A", "3A"],
  medium: ["2A", "3A", "SL"],
  slow: ["3A", "SL", "2S"],
};

const BASE_FARES = {
  "1A": 3200,
  "2A": 1800,
  "3A": 1100,
  CC: 950,
  EC: 1500,
  SL: 420,
  "2S": 180,
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePNR() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function searchTrains(from, to, date, travelClass = null) {
  // Seed randomness based on from+to+date for consistent results
  const seed = `${from}-${to}-${date}`;
  const count = randomBetween(4, 7);
  const trains = [];

  for (let i = 0; i < count; i++) {
    const template = TRAIN_TEMPLATES[i % TRAIN_TEMPLATES.length];
    const trainNo = `${randomBetween(10000, 29999)}`;
    const deptHour = randomBetween(4, 23);
    const deptMin = [0, 15, 30, 45][randomBetween(0, 3)];
    const depTime = `${String(deptHour).padStart(2, "0")}:${String(deptMin).padStart(2, "0")}`;
    const durationMins = randomBetween(120, 1440);
    const arrTime = addMinutes(depTime, durationMins);
    const classes = CLASSES[template.speed];

    const classAvailability = classes.reduce((acc, cls) => {
      const avail = randomBetween(0, 80);
      acc[cls] = {
        available: avail,
        fare: Math.round(BASE_FARES[cls] * (0.8 + Math.random() * 0.6)),
        status: avail === 0 ? "WL" : avail < 10 ? "RAC" : "AVL",
        waitlist: avail === 0 ? randomBetween(1, 30) : null,
      };
      return acc;
    }, {});

    trains.push({
      trainNo,
      trainName: `${trainNo} ${template.name}`,
      type: template.type,
      from,
      to,
      fromName: STATIONS.find((s) => s.code === from)?.name || from,
      toName: STATIONS.find((s) => s.code === to)?.name || to,
      depTime,
      arrTime,
      duration: formatDuration(durationMins),
      durationMins,
      date,
      classes: classAvailability,
      runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].filter(
        () => Math.random() > 0.3
      ),
      pantry: Math.random() > 0.4,
    });
  }

  return trains.sort((a, b) => a.depTime.localeCompare(b.depTime));
}

export function generateBookingConfirmation(bookingData) {
  return {
    pnr: generatePNR(),
    bookingId: `RS${Date.now()}`,
    status: "CONFIRMED",
    ...bookingData,
    bookedAt: new Date().toISOString(),
  };
}
