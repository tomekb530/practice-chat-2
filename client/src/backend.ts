import axios from 'axios';
import { io } from "socket.io-client";
const API_URL = 'http://localhost:2137';
export const socket = io(API_URL);

async function get(url: string) {
    return await axios.get(url,{ headers:{'Authorization': 'Bearer ' + localStorage.getItem('token')}});
}

async function post(url: string, data: any) {
    return await axios.post(url, data,{ headers:{'Authorization': 'Bearer ' + localStorage.getItem('token')}});
}

async function put(url: string, data: any) {
    return await axios.put(url, data,{ headers:{'Authorization': 'Bearer ' + localStorage.getItem('token')}});
}

async function del(url: string) {
    return await axios.delete(url,{ headers:{'Authorization': 'Bearer ' + localStorage.getItem('token')}});
}

export const getCurrentUser = async () => {
    try{
        const response = await get(API_URL+'/api/current_user');
        return response.data;
    }catch(err){
        return false;
    }    
};

export const createUserWithEmailAndPassword = (email: string, password: string, username: string) => {

    return post(API_URL+'/auth/register', { username, password, email, name: username });

};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
    try{
        const response = await post(API_URL+'/auth/login', { email, password });
        return response;
    }
    catch(err){
        console.log(err);
        return false;
    }
};

export const sendMessageData =  (content: string, channel: string) => {
    return post(API_URL+'/api/channels/'+channel+'/messages', { content });
};

export const login =  (username: string, password: string) => {
    socket.disconnect();
    socket.connect();
    return post(API_URL+'/api/login', { username, password });
};

export const getUserInfo =  (id: string) => {
    return get(API_URL+'/api/users/'+id);
};

export const getChannelList = () => {
    return get(API_URL+'/api/channels');
};

export const switchCurrentChannel = (channel: string) => {
    socket.emit("channelSwitch", { channel });
};

export const getMessages = (channel: string) => {
    return get(API_URL+'/api/channels/'+channel+'/messages');
};

export const getMessage = async (id: string) => {
    if (!id) return false;
    const response = await get(API_URL+'/api/messages/'+id);
    if (response.status === 200) {
        //console.log(response.data)
        const usr = await getUserInfo(response.data.message.sender);
        response.data.sender = usr.data.user;
        return response.data;
    }
    return false;
};


socket.on("connect", () => {
    socket.emit("auth", { token: localStorage.getItem('token') });
});

socket.on("auth", (data: any) => {
    //console.log(data)
});


