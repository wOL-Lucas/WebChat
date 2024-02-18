"use strict";
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const express = require('express');
const WebSocket = require('ws');
const { decode } = require('punycode');


class server{
    constructor(){
        this.port = 6800;

        this.app = express();
        this.app.use(bodyParser.json());

        this.server = https.createServer({
            key: fs.readFileSync('./auth/key.pem'),
            cert: fs.readFileSync('./auth/cert.pem')
        },this.app);

        this.io = new WebSocket.Server({server: this.server});
        this.io.on('connection', (socket)=>{
            console.log("New connection");
            socket.emit('message', 'Connected');

            socket.on('message',(message)=>{
                console.log("message received ", message.toString());
                socket.send('Message received');
            })
        });

        
        this.app.post('/login', (req, res)=>{
            const token = jwt.sign({"username":req.body.username, "expiresIn":"1h"}, fs.readFileSync('./auth/privatekey.pem'), {algorithm: 'RS256'});
            res.json({"token":token});
        })


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
}

const app = new server();
app.startServer();

