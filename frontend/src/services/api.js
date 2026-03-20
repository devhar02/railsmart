const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

export const api = {
  getStations: () => get("/stations"),
  searchTrains: (params) => post("/search", params),
  bookTicket: (params) => post("/book", params),
  initiatePayment: (params) => post("/payment/initiate", params),
  verifyPayment: (params) => post("/payment/verify", params),
};
