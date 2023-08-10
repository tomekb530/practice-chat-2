import jwt from 'jsonwebtoken';
import config from '../config.js';
export const chat = {};
chat.connections = [];

export const socket = (io, db) => {
    io.on('connection', (socket) => {
        chat.connections.push(socket);
        setTimeout(() => {
            if(!socket.authorized){
                socket.emit("error", { message: "Unauthorized" })
                socket.disconnect();
            }
        }, 1000);
        socket.on("auth", async (data) => {
            let  token  = data.token;
            let res;
            let user;
            try{
                res = await jwt.verify(token, config.JWT_SECRET)
                user = await db.models.User.findOne({ username: res.name });
            }catch(err){
                socket.emit("auth", { message: "Unauthorized" })
                socket.disconnect();
            }
            if(res){
                socket.authorized = true;
                socket.user = user;
                socket.emit("auth", { message: "Authorized" });
            }else{
                socket.emit("auth", { message: "Unauthorized" })
                socket.disconnect();
            }
        });

        socket.on("channelSwitch", async (data) => {
            let { channel } = data;
            let user = socket.user;
            console.log(user, channel)
            if(user){
                user.currentChannel = channel;
                await user.save();
                //socket.emit("channelSwitch", { message: "Channel switched" });
            }else{
                //socket.emit("channelSwitch", { message: "Unauthorized" })
                socket.disconnect();
            }
        });
    });
    io.on('disconnect', (socket) => {
        console.log('a user disconnected');
        chat.connections.pop(socket);
    });
};