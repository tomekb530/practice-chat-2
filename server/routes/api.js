import jsonwebtoken from 'jsonwebtoken';
import config from '../config.js';
import { Router } from 'express';
const app = Router();
let db;
import { chat } from '../utils/socket.js';
import {runCommand} from '../utils/commands.js';
import { commands } from '../utils/commands.js';

async function tokenCheck(req){
    let token = req.headers.authorization;
    if(token){
        token = token.split(" ")[1];
        let res;
        let user;
        try{
        res = await jsonwebtoken.verify(token, config.JWT_SECRET)
        user = await db.models.User.findOne({ username: res.name });
        }catch(err){
            return false;
        }
        if(res){
            return user;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

app.use(async (req, res, next) => {
    let token = await tokenCheck(req);
    if(token){
        req.user = token;
        next();
    }else{
        res.status(401).json({ message: "Unauthorized" });
    }
});

app.get("/", async (req, res) => {
    res.status(200).json({ message: "API is working" });
});



app.get("/current_user", async (req, res) => {
    res.status(200).json({ user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        currentChannel: req.user.currentChannel || db.models.Channel.findOne({ name: "general" }).id,
    } });
});

app.get("/users/:id", async (req, res) => {
    let { id } = req.params;
    if(id){
        let user = await db.models.User.findOne({ id });
        if(user){
            res.status(200).json({ user: {
                username: user.username,
                name: user.name,
                avatar: user.avatar,
            } });
        }else{
            res.status(404).json({ message: "User not found" });
        }
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});

app.post("/current_user/channel", async (req, res) => {
    let { channel } = req.body;
    if(channel){
        let user = await db.models.User.findOne({ username: req.user.username });
        user.currentChannel = channel;
        user.save().then((user) => {
            if(!user){
                res.status(500).json({ message: "Internal server error" });
            }else{
                res.status(200).json({ user });
            }
        });
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});

app.post("/current_user/avatar", async (req, res) => {
    let { avatar } = req.body;
    if(avatar){
        let user = await db.models.User.findOne({ username: req.user.username });
        user.avatar = avatar;
        user.save().then((user) => {
            if(!user){
                res.status(500).json({ message: "Internal server error" });
            }else{
                res.status(200).json({ user });
            }
        });
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});

app.post("/current_user/name", async (req, res) => {
    let { name } = req.body;
    if(name){
        let user = await db.models.User.findOne({ username: req.user.username });
        user.name = name;
        user.save().then((user) => {
            if(!user){
                res.status(500).json({ message: "Internal server error" });
            }else{
                res.status(200).json({ user });
            }
        });
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});

app.get("/commands", async (req, res) => {
    res.status(200).json({ commands });
});

app.get("/channels", async (req, res) => {
    let channels = await db.models.Channel.find({});
    res.status(200).json({ channels });
});

app.post("/channels", async (req, res) => {
    let { name } = req.body;
    if(name){
        let channel = new db.models.Channel({
            id: Date.now().toString(),
            name,
        });
        channel.save().then((channel) => {
            if(!channel){
                res.status(500).json({ message: "Internal server error" });
            }else{
                res.status(200).json({ channel });
            }
        });
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});

app.get("/channels/:id/messages", async (req, res) => {
    let channel = req.params.id;
    if(channel){
       let chan = await db.models.Channel.findOne({ id: channel });
         if(chan){
            let messages = chan.messages;
            res.status(200).json({ messages });
        }else{
            res.status(404).json({ message: "Channel not found" });
        }
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});


app.post("/channels/:id/messages", async (req, res) => {
    let channel = req.params.id;
    let { content } = req.body;
    if(channel && content){
        if(content.startsWith("/")){
            let command = content.split(" ")[0].replace("/", "");
            let args = content.split(" ").slice(1);
            let result = await runCommand(req.user,command, args, db);
            if(result){
                res.status(200).json({ message: "Command executed" });
                let message = new db.models.Message({
                    id: Date.now().toString(),
                    sender: "0",
                    content:req.user.name + " executed command " + command + " with args " + args.join(" "),
                    timestamp: (new Date()).toUTCString(),
                    channel,
                });
                message.save().then((message) => {
                    chat.connections.forEach((connection) => {
                        if(connection.user.currentChannel === channel){
                            connection.emit("message", message);
                        } 
                    });
                });
            }else{
                //res.status(404).json({ message: "Command not found" });
            }
        }else{
            let chan = await db.models.Channel.findOne({ id: channel });
            if(chan){
                let message = new db.models.Message({
                    id: Date.now().toString(),
                    sender: req.user.id,
                    content,
                    timestamp: (new Date()).toUTCString(),
                    channel,
                });
                message.save().then((message) => {
                    if(!message){
                        res.status(500).json({ message: "Internal server error" });
                    }else{
                        chan.messages.push(message);
                        chan.save().then((chan) => {
                            if(!chan){
                                res.status(500).json({ message: "Internal server error" });
                            }else{
                                res.status(200).json({ message });
                                chat.connections.forEach((connection) => {
                                    if(connection.user.currentChannel === chan.id){
                                        connection.emit("message", message);
                                    } 
                                });
                            }
                        });
                    }
                });
        }else{
            res.status(404).json({ message: "Channel not found" });
        }
    }
    }
});

app.get("/messages/:id", async (req, res) => {
    let { id } = req.params;
    if(id){
        let message = await db.models.Message.findOne({ id });
        if(message){
            res.status(200).json({ message });
        }else{
            res.status(404).json({ message: "Message not found" });
        }
    }else{
        res.status(400).json({ message: "Bad request" });
    }
});
    

export default dbA => {
    db = dbA;
    return app;
};
