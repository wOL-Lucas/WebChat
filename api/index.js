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

class server{
    constructor(){
        this.port = 6800;

        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.server = https.createServer({
            
            key: fs.readFileSync('./auth/key.pem'),
            cert: fs.readFileSync('./auth/cert.pem')

        },this.app);

        this.users = JSON.parse(fs.readFileSync('./data/users.json')).users;
        this.rooms = {};
        this.instanciate_existing_rooms();


        this.app.post('/login', (req, res)=>{
            const token = jwt.sign({"username":req.body.username, "expiresIn":"1h"}, fs.readFileSync('./auth/privatekey.pem'), {algorithm: 'RS256'});
            res.json({"token":token});
        })

        this.app.post('/chats', (req,res)=>{
            console.log("post for: ", req.body.name)
            let created = this.create_room(req.body.name, req.body.users)
            if(!created){
                return res.status(400).json({"message":"Room already exists"});
            }
            
            //fs.writeFileSync('./data/users.json', "{\"users\":" + JSON.stringify(this.users) + "}");
            return res.json({"message":"Room created", "room_name":req.body.name}) 

        })

        this.app.get('/chats', (req, res)=>{
            const userName = req.query.user;
            for (const user of this.users){
                if(user.username === userName){
                    return res.json(user.rooms);
                }
            }

            return res.status(404).json({"message":"No rooms found for this user"});
        });

    };

    startServer(){
        this.server.listen(this.port, ()=>{
            console.log(`Server is running on port ${this.port}`);
        });
    }

    verify_token(token){
        return jwt.verify(token, fs.readFileSync('./auth/privatekey.pem'), {algorithms: ['RS256']}, (err, decoded)=>{
            if (err){
                return false;
            }
            return true;
        });
    }

    create_room(name, users){
        name = name.replace(/ /g, "_")

        let room = new Room(name, users);
        if(this.rooms[room.name]){
            return false;
        }

        const room_websocket = new WebSocket.Server({noServer:true});
        
        room_websocket.on('connection', (socket)=>{
            socket.on('message', (message)=>{
                room_websocket.clients.forEach((client)=>{
                    if(client !== socket && client.readyState === WebSocket.OPEN){
                        client.send(message);
                    }
                });
            });
        });

        this.server.on('upgrade', (request, socket, head)=>{
            const pathname = request.url.split('/')[2];
            if(!pathname){
                socket.destroy();
            }


            if(pathname === room.name){
                room_websocket.handleUpgrade(request, socket, head, (ws)=>{
                    room_websocket.emit('connection', ws, request);
                });
            }
        });

        this.rooms[room.name] = {"room":room, "websocket":room_websocket};
        Array.from(this.users).forEach((user)=>{
            if(user.username == users[0].username){
                user.rooms.push(room);
                console.log("user ", user.rooms)
            }
        });

        console.log("rooms ", this.rooms);

        return true;
    }

    instanciate_existing_rooms(){
        Array.from(this.users).forEach((user)=>{
            Array.from(user.rooms).forEach((room)=>{
                let room_websocket = new WebSocket.Server({noServer:true});
                room_websocket.on('connection', (socket)=>{

                    socket.on('message', (message)=>{
                        room_websocket.clients.forEach((client)=>{
                            if(client !== socket && client.readyState === WebSocket.OPEN){
                                client.send(message);
                            }
                        });
                    });
                });

                this.server.on('upgrade', (request, socket, head)=>{
                    const pathname = request.url.split('/')[2];
                    if(!pathname){
                        socket.destroy();
                    }

                    if(pathname === room.name){
                        room_websocket.handleUpgrade(request, socket, head, (ws)=>{
                            room_websocket.emit('connection', ws, request);
                        });
                    }
                });

                this.rooms[room.name] = {"room":room, "websocket":room_websocket};
            })
        })
    }
}

const app = new server();
app.startServer();

