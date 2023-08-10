import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = 'mongodb://127.0.0.1:21337/chatapp';

const db = {
    models: {},
    connected: false,
    mongoose: mongoose
};

import * as models from './models/index.js';

for(let model in models){
    db.models[model] = models[model](mongoose);
}

async function connect() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Database connected");
        db.connected = true;
        const general = await db.models.Channel.findOne({ name: "general" });
        if(!general){
            await db.models.Channel.create({
                id:0,
                name: "general"
            });
        }
        const systemUser = await db.models.User.findOne({ username: "system" });
        if(!systemUser){
            await db.models.User.create({
                id:0,
                username: "system",
                password: "",
                email: "",
                name: "System",
                avatar: "https://cdn.icon-icons.com/icons2/2066/PNG/512/cog_icon_125323.png",
                rank: "admin",
                banned: false,
                muted: false,
                currentChannel: "0"
            });
        }
    } catch (error) {
        console.log(error);
    }
}

connect();

export default db;