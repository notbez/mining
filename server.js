// server.js
console.log("Starting server...");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5500;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Mongo connection check
if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  });

// Load routes
let miningRoutes, userRoutes, claimRoutes, boostRoutes, ratingRoutes;
try {
  miningRoutes = require("./routes/mining");
  userRoutes = require("./routes/user");
  claimRoutes = require("./routes/claim");
  boostRoutes = require("./routes/boost");
  ratingRoutes = require("./routes/rating");
} catch (err) {
  console.error("Error loading route files:", err.message || err);
  process.exit(1);
}

// Mount API under /api/*
app.use("/api/mining", miningRoutes);
app.use("/api/user", userRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/boost", boostRoutes);
app.use("/api/rating", ratingRoutes);

// Also keep backwards-compatible mounts under /user and /mining
// so old frontend calls (e.g. /user/daily-login) keep working.
app.use("/mining", miningRoutes);
app.use("/user", userRoutes);
app.use("/claim", claimRoutes);
app.use("/boost", boostRoutes);
app.use("/rating", ratingRoutes);

// Static HTML pages (views)
const pages = [
  "index",
  "mining",
  "rating",
  "tasks",
  "friends",
  "daily",
  "weekly",
  "buy-boost",
];

pages.forEach((p) => {
  const route = p === "index" ? "/" : `/${p}`;
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "views", `${p}.html`));
  });
});

// 404 fallback (serve a small 404 page if present)
app.use((req, res) => {
  const notFoundPath = path.join(__dirname, "views", "404.html");
  return res.status(404).sendFile(notFoundPath, (err) => {
    if (err) res.status(404).json({ error: "Not found" });
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error("Internal Error:", err.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});