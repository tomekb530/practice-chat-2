function create(mongoose){
    const userSchema = new mongoose.Schema({
        id: {
            type: String,
            unique: true
        },
        username: {
            type: String,
            unique: true
        },
        password: String,
        email: {
            type: String,
            unique: true
        },
        name: String,
        avatar: String,
        rank: {
            type: String,
            default: "user",
        },
        banned: {
            type: Boolean,
            default: false,
        },
        muted: {
            type: Boolean,
            default: false,
        },
        currentChannel: {
            type: String,
            default: "0",
        },
        isGoogle: {
            type: Boolean,
            default: false,
        },
        googleId: {
            type: String,
            default: "",
        },
    });
    return mongoose.model('User', userSchema);
}

export default create;