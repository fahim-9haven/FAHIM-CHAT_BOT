module.exports.config = {
  name: "ultragf",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Ultra AI GF (memory + mood + voice + pic)",
  commandCategory: "AI",
  usages: "",
  cooldowns: 0
};

const axios = require("axios");
const fs = require("fs-extra");

let memory = {};
let lastReply = {};
let boyfriend = null; // special user

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  // spam control
  if (lastReply[senderID] && Date.now() - lastReply[senderID] < 4000) return;
  lastReply[senderID] = Date.now();

  // save memory
  memory[senderID] = body;

  // set first user as boyfriend 😏
  if (!boyfriend) boyfriend = senderID;

  let name = senderID == boyfriend ? "জান" : "তুমি";

  let reply;

  try {
    const res = await axios.get(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(body)}&owner=Megh&botname=MeghKonna`);
    reply = res.data.message;
  } catch (e) {
    const fallback = [
      "উফফ তুমি এমন বললে আমি হারিয়ে যাই 🥲💖",
      "তুমি কি আমার crush নাকি? সবসময় মনে পড়ো 😳💕",
      "আমার সাথে এমন behave করলে আমি কিন্তু সিরিয়াস হয়ে যাবো 😤❤️"
    ];
    reply = fallback[Math.floor(Math.random() * fallback.length)];
  }

  // mood system 😏
  const moods = [
    " 😏💞",
    " 🥺❤️",
    " 😳💕",
    " 😤💘",
    " 🙈💖"
  ];

  reply = `${name}, ${reply}${moods[Math.floor(Math.random() * moods.length)]}`;

  // random pic
  const imgURL = `https://picsum.photos/400/400?random=${Math.floor(Math.random()*1000)}`;
  const imgPath = __dirname + "/cache/ultra.jpg";

  const img = await axios.get(imgURL, { responseType: "arraybuffer" });
  fs.writeFileSync(imgPath, Buffer.from(img.data, "utf-8"));

  // voice
  const voiceURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(reply)}&tl=bn&client=tw-ob`;
  const voicePath = __dirname + "/cache/ultra.mp3";

  const voice = await axios.get(voiceURL, { responseType: "arraybuffer" });
  fs.writeFileSync(voicePath, Buffer.from(voice.data, "utf-8"));

  return api.sendMessage({
    body: reply,
    attachment: [
      fs.createReadStream(imgPath),
      fs.createReadStream(voicePath)
    ]
  }, threadID, messageID);
};

// command to set boyfriend manually
module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  if (args[0] == "setbf") {
    boyfriend = senderID;
    return api.sendMessage("😏 এখন থেকে তুমি আমার জান 💖", threadID);
  }
};