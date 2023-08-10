import { Router } from 'express';
const app = Router();
import fs from 'fs';
import path from 'path';
import jsonwebtoken from 'jsonwebtoken';
import config from '../config.js';
import bcrypt from 'bcrypt';
import queryString from 'query-string';
import GoogleAuth from 'google-auth-library';
let db;



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if(db.connected){
        const user = await db.models.User.findOne({ email: email });
        if(user){
            console.log(user)
            const match = await bcrypt.compare(password, user.password);
            if(match){
                let name = user.username;
                const token = jsonwebtoken.sign({ name }, config.JWT_SECRET);
                res.status(200).json({ token });
            }else{
                res.status(401).json({ message: "Invalid credentials" });
            }
        }else{
            res.status(401).json({ message: "Invalid credentials" });
        }
    }else{
        res.status(500).json({ message: "Database not connected" });
    }
});

app.post('/register', async (req, res) => {
    const { username, password, email, name } = req.body;
    if(db.connected){
        try{
            if(username && password && email && name){
                const findUser = await db.models.User.findOne({ username });
                if(findUser){
                    res.status(409).json({ message: "Username already exists" });
                }else if(await db.models.User.findOne({ email })){
                    res.status(409).json({ message: "Email already exists" });
                }else{
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const user = new db.models.User({
                        id: Date.now().toString(),
                        username,
                        password: hashedPassword,
                        email,
                        name,
                        avatar: "",                
                    });
                    user.save().then((user) => {
                        if(!user){
                            res.status(500).json({ message: "Internal server error" });
                        }else{
                            const token = jsonwebtoken.sign({ username }, config.JWT_SECRET);
                            res.status(200).json({ token });
                        }
                    });
                }
            }else{
                res.status(400).json({ message: "Invalid credentials" });
            }
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }else{
        res.status(500).json({ message: "Database not connected" });
    }
});


app.get('/google', (req, res) => {
    const stringifiedParams = queryString.stringify({
        client_id: config.GOOGLE_CLIENTID,
        redirect_uri: 'http://localhost:2137/auth/google/callback',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ].join(' '),
        response_type: 'code',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`);
});

app.get('/google/callback', async (req, res) => {
    const code = req.query.code;
    const auth = new GoogleAuth.OAuth2Client({
        clientId: config.GOOGLE_CLIENTID,
        clientSecret: config.GOOGLE_SECRET,
        redirectUri: 'http://localhost:2137/auth/google/callback',
    });
    let data;
    let email;
    let name;
    let picture;
    let user;
    try{
        data = await auth.getToken(code);
        const tokens = data.tokens;
        auth.setCredentials(tokens);
        user = await auth.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.GOOGLE_CLIENTID,
        });
        email = user.getPayload().email;
        name = user.getPayload().name;
        picture = user.getPayload().picture;
    }catch(error){
        console.log(error);
    }
    if(db.connected){
        try{
            if(email && name){
                const findUser = await db.models.User.findOne({ email });
                if(findUser){
                    const token = jsonwebtoken.sign({ name: findUser.username }, config.JWT_SECRET);
                    res.send(`<script>window.opener.postMessage('${token}', '*');</script>`);
                }else{
                    const userDb = await new db.models.User({
                        id: Date.now().toString(),
                        username: email,
                        password: "",
                        email,
                        name,
                        avatar: picture,
                        isGoogle: true,
                        googleId: user.getUserId(),
                    });
                    userDb.save().then((user) => {
                        if(!user){
                            res.status(500).json({ message: "Internal server error" });
                        }else{
                            const token = jsonwebtoken.sign({ name: user.username }, config.JWT_SECRET);
                            res.send(`<script>window.opener.postMessage('${token}', '*');</script>`);
                        }
                    });
                }
            }else{
                res.status(400).json({ message: "Invalid credentials" });
            }
        }catch(error){
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }else{
        res.status(500).json({ message: "Database not connected" });
    }
});

export default dbA => {
    db = dbA;
    return app;
};