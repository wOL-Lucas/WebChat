"use strict";
const https = require('http');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const {Server} = require('socket.io');


class server{
    constructor(){
        this.port = 6800;
        this.app = express();
        this.secret_key = fs.readFileSync('key.pem');

        this.server = https.createServer({
            key: this.secret_key,
            cert: fs.readFileSync('cert.pem')

        },this.app);

        this.io = new Server(this.server)
        this.io.on('connection', (socket)=>{
            console.log("nova conexão");
            socket.emit('message', 'Connected');
        });

        
        this.app.post('/login', (req, res)=>{
            const token = jwt.sign({"username":req.body.username, "expiresIn":"1h"}, this.secret_key);
            res.json(token);
        })


    };

    startServer(){
        this.server.listen(this.port, ()=>{
            console.log(`Server is running on port ${this.port}`);
        });
    }
}

const app = new server();
app.startServer();

