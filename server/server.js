import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import db from './utils/mongo/mongo.js';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: '*',
    }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));
app.use(cors({

}))
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile("index.html", { root: path.join(__dirname, '../dist') });
});

import auth from './routes/auth.js';

app.use('/auth',auth(db));

import api from './routes/api.js';

app.use('/api', api(db));

const PORT = process.env.PORT || 2137;

import { socket } from './utils/socket.js';
socket(io, db)
server.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}.`);
});

