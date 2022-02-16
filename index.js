const redis = require("redis");
const client = redis.createClient();

const express = require("express");
const app = express();
const PORT = 5000;
const http = require("http");
const socketio = require("socket.io");

app.set("view engine", "ejs");

const server = http.createServer(app);
const io = socketio(server).listen(server);

server.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});

io.on("connection", socket => {
    sendMessage(socket);

    socket.on("message", ({ message, from }) => {
        client.rpush("messages", `${from}:${message}`);

        io.emit("message", { from, message });
    });
});

app.get("/message", (req, res) => {
    const username = req.query.username;

    io.emit("joined", username);
    res.render("message", { username });
});

app.get("/", (req, res) => {
    res.render("client");
});



function sendMessage(socket) {
    client.lrange("messages", "0", "-1", (err, data) => {
        data.map(x => {
            const UserMessage = x.split(":");
            const redisUser = UserMessage[0];
            const redisMessage = UserMessage[1];

            socket.emit("message", {
                from: redisUser,
                message: redisMessage
            });
        });
    });
}