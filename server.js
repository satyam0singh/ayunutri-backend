import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load from .env
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error("❌ ERROR: Missing APP_ID or APP_CERTIFICATE in .env");
  process.exit(1);
}

// Root test
app.get("/", (req, res) => {
  res.send("Agora Token Server is running ✔");
});

// Correct route
app.get("/rtcToken", (req, res) => {
  const channelName = req.query.channelName;
  const uid = Number(req.query.uid || 0);

  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const role = RtcRole.PUBLISHER;
  const expireSeconds = 3600;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + expireSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
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
