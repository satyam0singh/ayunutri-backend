require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-token");

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.APP_ID;
const APP_CERT = process.env.APP_CERT;

if (!APP_ID || !APP_CERT) {
  console.error("❌ ERROR: Missing APP_ID or APP_CERT in environment variables");
  process.exit(1);
}

app.get("/generateToken", (req, res) => {
  const channelName = req.query.channelName;
  const uid = req.query.uid || 0;

  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    expireTime
  );

  res.json({
    token,
    channelName,
    uid,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Agora Token Server running on port ${PORT}`);
});
