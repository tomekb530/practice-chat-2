import { User } from "./User";

export class Message{
    content: string;
    sender: User;
    id: string;
    timestamp: Date;
    constructor(id: string, content: string, sender: User, timestamp: Date){
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }
}