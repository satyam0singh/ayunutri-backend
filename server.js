// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.json());

// Load from environment (Render dashboard or .env locally)
const APP_ID = process.env.APP_ID;
const APP_CERT = process.env.APP_CERT;

if (!APP_ID || !APP_CERT) {
  console.error("❌ ERROR: Missing APP_ID or APP_CERT in environment variables");
  process.exit(1);
}

// Simple test route
app.get("/", (req, res) => {
  res.send("Agora Token Server is running ✔");
});

// Main token route (this is what Flutter calls)
app.get("/rtcToken", (req, res) => {
  const channelName = req.query.channelName;
  const uidParam = req.query.uid;

  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const uid = Number(uidParam || 0);
  const role = RtcRole.PUBLISHER;

  const expireSeconds = 3600; // 1 hour
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpire = now + expireSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERT,
      channelName,
      uid,
      role,
      privilegeExpire
    );

    return res.json({
      rtcToken: token,
      channelName,
      uid,
      expiresAt: privilegeExpire,
    });
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Agora Token Server running on port ${PORT}`);
});
