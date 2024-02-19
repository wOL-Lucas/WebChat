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
        this.users = JSON.parse(fs.readFileSync('./data/users.json')).users;
        this.rooms = {};

        this.server = https.createServer({
            
            key: fs.readFileSync('./auth/key.pem'),
            cert: fs.readFileSync('./auth/cert.pem')

        },this.app);

        this.app.post('/login', (req, res)=>{
            const token = jwt.sign({"username":req.body.username, "expiresIn":"1h"}, fs.readFileSync('./auth/privatekey.pem'), {algorithm: 'RS256'});
            res.json({"token":token});
        })

        this.app.post('/chats', (req,res)=>{
            let created = this.create_room(req.body.name.replace(/ /g, "_"), req.body.users)
            if(!created){
                return res.status(400).json({"message":"Room already exists"});
            }
            
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
        let room = new Room(name, users);
        if(this.rooms[room.name]){
            return false;
        }

        const room_websocket = new WebSocket.Server({noServer:true});
        
        room_websocket.on('connection', (socket)=>{
            socket.on('message', (message)=>{
                console.log(message.toString());
                room_websocket.emit('message', message);
            });
        });

        this.server.on('upgrade', (request, socket, head)=>{
            const pathname = request.url.split('/')[2];
            if(!pathname){
                socket.destroy();
            }

            console.log("Atempt for", pathname)

            if(pathname === room.name){
                room_websocket.handleUpgrade(request, socket, head, (ws)=>{
                    room_websocket.emit('connection', ws, request);
                });
            }
        });

        this.rooms[room.name] = {"room":room, "websocket":room_websocket};
        Array.from(this.users).forEach((user)=>{
            if(user.name == users[0].name){
                console.log("user found", user);
                user.rooms.push(room.name);
            }
        });

        console.log("rooms ", this.rooms);

        return true;
    }
}

const app = new server();
app.startServer();

