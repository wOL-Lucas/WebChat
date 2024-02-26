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
const url = require('url');

class server {
    constructor() {
        this.port = 6800;
        this.privateKey = fs.readFileSync('./auth/privatekey.pem');
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
                const token = jwt.sign({ "username": req.body.username, "expiresIn": "1h" }, this.privateKey, { algorithm: 'RS256' });
                return res.json({ "token": token });
            }

            return res.status(401).json({ "message": "Invalid credentials" });
        })

        this.app.post('/ws/login', (req, res) => {
            if (!req.headers.authorization) {
                return res.status(401).json({ "message": "No token provided" });
            }

            const token = req.headers.authorization.split(' ')[1];
            const verified = this.verify_token(token);
            if (!verified) {
                return res.status(401).json({ "message": "Invalid token" });

            }else{
                const userRooms = [];
                for (const room of this.rooms) {
                    for (const user of room.users) {
                        if (user.username === verified.username) {
                            userRooms.push(room.name);
                        }
                    }
                }

                const ephemeralToken = jwt.sign({ "username": verified.username, "rooms":userRooms,"expiresIn": "1m" }, this.privateKey, { algorithm: 'RS256' });
                return res.json({ "token": ephemeralToken });
            }
        });

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
        return jwt.verify(token, this.privateKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                return false;
            }
            else {
                return decoded;
            }
        });
    }

    create_new_websocket(room) {
        let websocket = new WebSocket.Server({ noServer: true });

        websocket.name = room.name.toLowerCase().replace(/ /g, "_");
        websocket.users = room.users;

        websocket.on('connection', (socket) => {
            socket.on('message', (message) => {
                message = JSON.parse(message.toString());
                if(!message.message || !message.username || !message.datetime){
                    console.log("Invalid message ", message)
                    return;
                }
                else{
                    console.log("Message ", message)
                }

                websocket.clients.forEach((client) => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(message));
                    }
                });
            })
        })

        this.server.on('upgrade', (request, socket, head) => {
            const pathname = request.url.split('/')[2].split('?')[0];
            if (!pathname) {
                socket.destroy();
            }
            
            if (pathname === websocket.name) {
                websocket.handleUpgrade(request, socket, head, (ws) => {
                    const token = url.parse(request.url, true).query.token;
                    if(token) {
                        const verified = this.verify_token(token);
                        if (verified && verified.rooms.some((room) => room.toLowerCase().replace(/ /g, "_") === websocket.name)) {
                            console.log("verified")
                            websocket.emit('connection', ws, request);
                        }
                        else {
                            ws.close(1008, "Invalid token");
                        }
                    }
                    else{
                        ws.close(1008, "No token provided");
                    }
                });
            }
        });

        this.rooms[room.name] = { "room": room, "websocket": websocket };
    }

    create_room(name, users) {
        name = name.replace(/ /g, "_")

        let room = new Room(name, users);
        if (this.rooms[room.name]) {
            return false;
        }

        this.create_new_websocket(room);

        Array.from(this.users).forEach((user) => {
            if (user.username == users[0].username) {
                user.rooms.push(room);
            }
        });

        console.log("rooms ", this.rooms);

        return true;
    }


    instanciate_existent_rooms() {
        Array.from(this.rooms).forEach((room) => {
            this.create_new_websocket(room);
        });
    }
}

const app = new server();
app.startServer();

