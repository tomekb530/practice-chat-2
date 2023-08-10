import { User } from "./User";

export class Message{
    content: string;
    sender: User;
    id: string;
    channel: number;
    timestamp: Date;
    constructor(id: string, content: string, sender: User, timestamp: Date, channel: number){
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
        this.channel = channel;
    }
}