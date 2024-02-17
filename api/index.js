"use strict";
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const express = require('express');
const {Server} = require('socket.io');


class server{
    constructor(){
        this.port = 6800;

        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(this.request_middleware)

        this.server = https.createServer({
            
            key: fs.readFileSync('./auth/key.pem'),
            cert: fs.readFileSync('./auth/cert.pem')

        },this.app);

        this.io = new Server(this.server)
        this.io.on('connection', (socket)=>{
            console.log("nova conexão");
            socket.emit('message', 'Connected');
        });

        
        this.app.post('/login', (req, res)=>{
            const token = jwt.sign({"username":req.body.username, "expiresIn":"1h"}, fs.readFileSync('./auth/privatekey.pem'), {algorithm: 'RS256'});
            res.json({"token":token});
        })


        this.app.get('/login', (req, res)=>{
            res.sendFile(__dirname + '/public/login/login.html');
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


    request_middleware = (req, res, next)=>{
        if (req.path.startsWith('/login') || toString(req.path).startsWith("/public")){
            next();
            return;
        }
        
        
        const token = req.headers.cookie.split('=')[1];
        if (this.verify_token(token)){
            next();
        }
        else{
            res.status(401).json({"error":"Unauthorized"});
        }
    }
}

const app = new server();
app.startServer();

