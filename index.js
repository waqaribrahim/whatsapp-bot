const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "12345";
const ACCESS_TOKEN = "EAA82cWijRNQBQ0DNskUucXkbDbh0ZCtJcjNg46xzzmYQK4qoSCm2VupCaJACJuZCWrWikiEeH4hMpAsMVpCMxXi31F6f90NWiIFhTxc7gSRuHx8Oj9PjhOk1LuLRaZCuluvR7hxtENZCuHaiSrAc2dxgVvGJK8aci2hZA7Pg12IhsrRETo5LsOBmgwAZCZCaLEa7zPTUlSPGtdPsWN7IzIPx9yqgSPEg9XWQ8z2ZCxYxSY9wZA4in56wmaUmxlzmeZBuYTaQYDZAl3YD3Qu1vZCwZC4uf";
const PHONE_NUMBER_ID = "1049269184932468";


// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/whatsappbot")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// Order Schema
const Order = mongoose.model("Order", {
  name: String,
  phone: String,
  item: String,
  date: {
    type: Date,
    default: Date.now
  }
});


// Temporary order state
const orders = {};


// Webhook verification
app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }

});


// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {

  try {

    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {

      const from = message.from;
      const text = message.text?.body?.toLowerCase();

      let reply = "";
      const step = orders[from]?.step;

      console.log("User:", from, "Message:", text, "Step:", step);


      // Start
      if (text === "hi" || text === "hello") {

        delete orders[from];

        reply =
          "Welcome to Leo Cafe ☕\n\n1️⃣ Menu\n2️⃣ Location\n3️⃣ Contact";

      }

      // Open menu
      else if (!step && text === "1") {

        orders[from] = { step: "menu" };

        reply =
          "Our Menu 🍔\n\n1️⃣ Burger\n2️⃣ Pizza\n3️⃣ Coffee\n\nReply with item number";

      }

      // Menu selection
      else if (step === "menu") {

        if (text === "1") {
          orders[from] = { step: "name", item: "Burger" };
          reply = "🍔 Burger selected\n\nPlease send your name";
        }

        else if (text === "2") {
          orders[from] = { step: "name", item: "Pizza" };
          reply = "🍕 Pizza selected\n\nPlease send your name";
        }

        else if (text === "3") {
          orders[from] = { step: "name", item: "Coffee" };
          reply = "☕ Coffee selected\n\nPlease send your name";
        }

        else {
          reply = "Please select 1, 2, or 3 from the menu.";
        }

      }

      // Save order
      else if (step === "name") {

        const item = orders[from].item;

        await Order.create({
          name: text,
          phone: from,
          item: item
        });

        reply = `Thanks ${text}! 🎉\n\nYour order for ${item} is confirmed ✅`;

        delete orders[from];

      }

      else {

        reply = "Please type *hi* to start.";

      }


      // Send WhatsApp reply
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

    }

    res.sendStatus(200);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.sendStatus(500);

  }

});


// Admin panel route
app.get("/admin", async (req, res) => {

  try {

    const allOrders = await Order.find().sort({ date: -1 });

    res.json(allOrders);

  } catch (error) {

    res.send("Error loading orders");

  }

});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});