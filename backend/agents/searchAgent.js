import { searchTrains, STATIONS } from "./mockData.js";

export async function runSearchAgent({ from, to, date, travelClass }) {
  const fromStation = STATIONS.find(
    (s) => s.code === from || s.name.toLowerCase() === from.toLowerCase()
  );
  const toStation = STATIONS.find(
    (s) => s.code === to || s.name.toLowerCase() === to.toLowerCase()
  );

  if (!fromStation || !toStation) {
    return {
      success: false,
      error: `Station not found. Available: ${STATIONS.map((s) => s.name).join(", ")}`,
    };
  }

  const trains = searchTrains(fromStation.code, toStation.code, date, travelClass);

  // Hardcoded summary logic
  const fastTrains = trains.filter((t) =>
    ["RAJDHANI", "VANDEBHARAT", "SHATABDI", "DURONTO"].includes(t.type)
  );
  const summary =
    fastTrains.length > 0
      ? `${fastTrains[0].trainName} is the fastest option (${fastTrains[0].duration}).`
      : trains.length > 0
      ? `${trains[0].trainName} departs earliest at ${trains[0].depTime}.`
      : "No trains found for this route.";

  return {
    success: true,
    agent: "SearchAgent",
    from: fromStation,
    to: toStation,
    date,
    trains,
    summary,
    totalResults: trains.length,
  };
}
