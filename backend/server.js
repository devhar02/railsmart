import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║       RailSmart Backend API          ║
║       Running on port ${PORT}          ║
╠══════════════════════════════════════╣
║  Agents: Search, Book, Pay, Email    ║
║  POST /api/search                    ║
║  POST /api/book                      ║
║  POST /api/payment/initiate          ║
║  POST /api/payment/verify            ║
╚══════════════════════════════════════╝
  `);
});
