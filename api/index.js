"use strict";
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const Room = require('./entities/room');
const User = require('./entities/user');
const crypto = require('crypto');

class server {
    constructor() {
        this.port = 6800;

        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.server = https.createServer({

            key: fs.readFileSync('./auth/key.pem'),
            cert: fs.readFileSync('./auth/cert.pem')

        }, this.app);

        this.users = (() => { 
            const users = []
            let load = JSON.parse(fs.readFileSync('./data/users.json')).users 
            Array.from(load).forEach((user) => {
                const hash = crypto.createHash('sha256');
                hash.update(JSON.stringify(user));
                users.push(hash.digest('hex'));
            })
            return users;
        })();
        
        this.rooms = JSON.parse(fs.readFileSync('./data/rooms.json')).rooms;
        this.instanciate_existent_rooms();


        this.app.use((req, res, next) => {

            if (req.path === '/login') {
                return next();
            }

            let token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ "message": "No token provided" });
            } else {
                token = token.split(' ')[1];
            }

            const verified = this.verify_token(token);
            if (!verified) {
                return res.status(401).json({ "message": "Invalid token" });
            }
            else {
                req.user = verified.username;
                next();
            }
        })

        this.app.post('/login', (req, res) => {
            const hash = crypto.createHash('sha256');
            hash.update(JSON.stringify(req.body));
            let user = hash.digest('hex');

            if (this.users.includes(user)) {
                const token = jwt.sign({ "username": req.body.username, "expiresIn": "1h" }, fs.readFileSync('./auth/privatekey.pem'), { algorithm: 'RS256' });
                return res.json({ "token": token });
            }

            return res.status(401).json({ "message": "Invalid credentials" });
        })

        this.app.post('/chats', (req, res) => {
            console.log("post for: ", req.body.name)
            let created = this.create_room(req.body.name, req.body.users)
            if (!created) {
                return res.status(400).json({ "message": "Room already exists" });
            }

            //fs.writeFileSync('./data/users.json', "{\"users\":" + JSON.stringify(this.users) + "}");
            return res.json({ "message": "Room created", "room_name": req.body.name })

        })

        this.app.get('/chats', (req, res) => {
            const userChats = [];
            for (const room of this.rooms) {
                for (const user of room.users) {
                    if (user.username === req.user) {
                        userChats.push(room);
                    }
                }
            }

            if (userChats.length > 0) {
                return res.json(userChats);
            }

            return res.status(404).json({ "message": "No rooms found for this user" });
        });

    };

    startServer() {
        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

    verify_token(token) {
        return jwt.verify(token, fs.readFileSync('./auth/privatekey.pem'), { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                return false;
            }
            else {
                return decoded;
            }
        });
    }

    create_room(name, users) {
        name = name.replace(/ /g, "_")

        let room = new Room(name, users);
        if (this.rooms[room.name]) {
            return false;
        }

        const room_websocket = new WebSocket.Server({ noServer: true });

        room_websocket.users = users;
        room_websocket.on('connection', (socket) => {
            socket.on('message', (message) => {
                room_websocket.clients.forEach((client) => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            });
        });

        this.server.on('upgrade', (request, socket, head) => {
            const pathname = request.url.split('/')[2];
            if (!pathname) {
                socket.destroy();
            }


            if (pathname === room.name.toLowerCase().replace(/ /g, "_")){
                room_websocket.handleUpgrade(request, socket, head, (ws) => {
                    room_websocket.emit('connection', ws, request);
                });
            }
        });

        this.rooms[room.name] = { "room": room, "websocket": room_websocket };
        Array.from(this.users).forEach((user) => {
            if (user.username == users[0].username) {
                user.rooms.push(room);
                console.log("user ", user.rooms)
            }
        });

        console.log("rooms ", this.rooms);

        return true;
    }

    instanciate_existent_rooms() {
        Array.from(this.rooms).forEach((room) => {
            let room_websocket = new WebSocket.Server({ noServer: true });
            room_websocket.users = room.users;
            room_websocket.on('connection', (socket) => {
                socket.on('message', (message) => {
                    room_websocket.clients.forEach((client) => {
                        if (client !== socket && client.readyState === WebSocket.OPEN) {
                            client.send(message);
                        }
                    });
                });
            });

            this.server.on('upgrade', (request, socket, head) => {
                const pathname = request.url.split('/')[2];
                if (!pathname) {
                    socket.destroy();
                }

                if (pathname === room.name.toLowerCase().replace(/ /g, "_")) {
                    room_websocket.handleUpgrade(request, socket, head, (ws) => {
                        room_websocket.emit('connection', ws, request);
                    });
                }
            });

            this.rooms[room.name] = { "room": room, "websocket": room_websocket };
        })

    }
}

const app = new server();
app.startServer();

