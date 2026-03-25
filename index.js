const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔐 VERIFY TOKEN (same Meta dashboard me use karna hai)
const VERIFY_TOKEN = "waqar123";

// 🔑 WhatsApp API Token (Meta se copy karo)
const ACCESS_TOKEN = "EAA82cWijRNQBRLRb4Flngc7k8DbZAMSNLShdZCUmW2BZCwQzA5RdBdffYN1hs6AZCN5ZCxGL1oW9R4Sp2q2BIXT0EdnpPo0xme9KNcSixEyaJBcWTFCyGdKrmS3uF0xZCpSSyMKZBmS4SiqzcZBt02x0YdQUhJqKijBx4xvamB9176m0TEKoisGwIExUd6gFyCBh9FMpPPhK0vrdh7o54i1kX8rP1r3Sde4oyooJ5M5ZAKrT4bZCTq0QLIi0QHqn6UHs1QPTQrGfCbEANLsgLkH6Xx";

// 📱 Phone Number ID (Meta se lo)
const PHONE_NUMBER_ID = "1049269184932468";

// 🟢 ROOT CHECK (optional)
app.get("/", (req, res) => {
  res.send("WhatsApp Bot is Running 🚀");
});

// 🔵 WEBHOOK VERIFY (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified ✅");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 🟢 WEBHOOK RECEIVE (POST)
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.entry) {
      const msg = body.entry[0].changes[0].value.messages?.[0];

      if (msg) {
        const from = msg.from;
        const text = msg.text?.body.toLowerCase();

        console.log("Message:", text);

        let reply = "";

        // 🔥 SIMPLE BOT LOGIC
        if (text === "hi" || text === "hello") {
          reply = "👋 Welcome to Leo's Cafe\n\n1️⃣ Menu\n2️⃣ Order\n3️⃣ Location";
        } else if (text === "1") {
          reply = "🍔 Menu:\n- Burger\n- Pizza\n- Biryani";
        } else if (text === "2") {
          reply = "🛒 What would you like to order?";
        } else if (text === "3") {
          reply = "📍 We are located at Main Market";
        } else {
          reply = "❌ Invalid option\nType 'hi' to start again";
        }

        // 📤 SEND MESSAGE
        await axios.post(
          `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            text: { body: reply },
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// 🚀 IMPORTANT PORT FIX (Railway ke liye)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
