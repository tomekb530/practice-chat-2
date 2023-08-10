export class User{
    name: string;
    id: string;
    avatarUrl: string;
    constructor(name: string, id: string, avatarUrl: string){
        this.name = name;
        this.id = id;
        this.avatarUrl = avatarUrl;
    }
}