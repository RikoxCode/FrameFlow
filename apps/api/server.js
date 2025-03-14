import express from 'express';
import dotenv from "dotenv";
import fileUpload from 'express-fileupload';
import * as socket from "socket.io";
dotenv.config();

import { initializeAuth } from "./handlers/auth-handler.js";
import { initializeDropboxHandler } from "./handlers/dropbox-handler.js";

// Initialize express app
const app = express();

// Middleware for file uploads
app.use(fileUpload());
initializeDropboxHandler(app);

// Parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initializeAuth(app);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(`http://localhost:${process.env.PORT}`);
});

export const io = new socket.Server(app.listen(process.env.SOCKET_PORT, () => {
    console.log(`Socket server is running on port ${process.env.SOCKET_PORT}`);
    console.log(`http://localhost:${process.env.SOCKET_PORT}`);
}));