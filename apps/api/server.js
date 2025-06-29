import express from 'express';
import dotenv from "dotenv";
import fileUpload from 'express-fileupload';
import { Server } from "socket.io";
import http from "http";
import cors from 'cors';

import { initializeAuth } from "./handlers/auth-handler.js";
import { initializeDropboxHandler } from "./handlers/dropbox-handler.js";
import { initSocketServer } from "./handlers/socket-handler.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://hochzeits-app.netshlife.dev'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));


app.use(fileUpload());
initializeDropboxHandler(app, '/api/dropbox');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initializeAuth(app, '/api/auth');

server.listen(process.env.PORT, () => {
    console.log(`HTTP & Socket Server läuft auf Port ${process.env.PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://hochzeits-app.netshlife.dev'
        ],
        methods: ['GET', 'POST']
    }
});

initSocketServer(io);