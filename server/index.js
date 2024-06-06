const express = require("express");
const path = require("path");
const fs = require("fs");
const socket = require("socket.io");
const http = require("http");
const ejs = require("ejs");

const version = "1.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../source/")));

app.get("/", (req, res) => {
    if (req.method == "GET") {
        ejs.renderFile(path.join(__dirname, "../source/views/index.ejs"),
            { _SugarTemplateVersion: version, _NodeVersion: process.versions.node }, (err, str) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("An error occurred while rendering the page");
                } else {
                    res.status(200).send(str);
                }
            });
    }
});

app.get("/set", (req, res) => {
    if (req.url.indexOf("?") == -1 || req.url.indexOf("?set=") == -1) return res.status(400).send("Bad request");
    const set = req.url.split("?")[1].split("=")[1];

    if (set.indexOf("..") != -1) return res.status(400).send("Bad request");

    if (set && req.method == "GET") {
        if (fs.existsSync(path.join(__dirname, "../source/sets/", `${set}.json`))) {
            res.status(200).sendFile(path.join(__dirname, "../source/sets/", `${set}.json`));
        } else {
            res.status(404).send("Set not found");
        }
    } else {
        res.status(400).send("Bad request");
    }
});

app.use("/css", express.static(path.join(__dirname, "../build/css/")));

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const io = new socket.Server(server);

io.on("connection", (socket) => {
    console.log(`Accept ${socket.id} / ${socket.handshake.address}\n`);

    socket.on("disconnect", () => {
        console.log(`Connection ${socket.id} / ${socket.handshake.address} closed\n`);
    });

    socket.on("reload-complete", () => {
        console.log(`Socket ${socket.id} / ${socket.handshake.address} synced\n`);
    });
});

let lastChange = Date.now();
fs.watch(path.join(__dirname, "../source"), { recursive: true }, (eventType, filename) => {
    if (Date.now() - lastChange < 50) return;
    lastChange = Date.now();

    if (filename.endsWith(".scss")) {
        console.log(`File ${filename} changed, recompiling styles...`);
        require("child_process").exec("npm run compile:styles");
    }

    console.log(`Server contents updated, page is ready for reload`);
    // io.emit("reload", filename); // want to set up hot reloading? go ahead :)
});

console.log("Hot reloading enabled, watching for changes in /source directory.")