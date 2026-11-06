require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { WebSocketServer } = require("ws");


const ensureAdmin = require("./utils/ensureAdmin");

const leadRoutes = require("./routes/leadRoutes");
const callRoutes = require("./routes/callRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { vobizAnswer, vobizHangup, vobizStreamStatus } = require("./controllers/callController");
const { handleVobizConnection } = require("./services/voiceAgent");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


const allowedOrigins = [
  "https://grosslead-calling-uwwb.vercel.app",
  "https://grosslead-calling.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Calling CRM API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    voice: "Vobiz AI calling routes enabled"
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/calls", callRoutes);

// Vobiz webhooks are public endpoints. Vobiz sends form-encoded POST requests.
app.post("/webhooks/vobiz/answer", vobizAnswer);
app.post("/webhooks/vobiz/hangup", vobizHangup);
app.post("/webhooks/vobiz/stream-status", vobizStreamStatus);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname !== "/ws") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (websocket) => {
    wss.emit("connection", websocket, request);
  });
});

wss.on("connection", (websocket) => {
  console.log("Vobiz media WebSocket connected");
  handleVobizConnection(websocket);
});

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdmin();
    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
      console.log(`Vobiz WebSocket ready at /ws`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
