const noblox = require("noblox.js");
const fetch = require("node-fetch");

const BOT_COOKIE = process.env.BOT_COOKIE;
const REPORT_API = process.env.REPORT_API; // Your backend URL
const TARGET_BRAINROTS = (process.env.TARGET_BRAINROTS || "").split(",").map(s=>s.trim()).filter(Boolean);

async function login() {
  const acc = await noblox.setCookie(BOT_COOKIE);
  console.log("Logged in as", acc.UserName);
}

async function scanOnce() {
  if (!REPORT_API || !TARGET_BRAINROTS.length) return console.log("Missing API or targets");
  const q = encodeURIComponent(TARGET_BRAINROTS.join(","));
  const res = await fetch(`${REPORT_API}/search?brainrots=${q}`);
  if (!res.ok) return console.log("Reporter error");
  const data = await res.json();
  for (const hit of data.hits) {
    console.log(`✅ Brainrots found: ${hit.brainrots.join(", ")} in JobId: ${hit.jobId}`);
    console.log(`Web join link: https://www.roblox.com/games/start?placeId=${hit.placeId}&gameInstanceId=${hit.jobId}`);
  }
}

async function mainLoop() {
  await login();
  setInterval(scanOnce, 10000); // scan every 10s
}

mainLoop();
