function create(mongoose){
    const messageSchema = new mongoose.Schema({
        id: {
            type: String,
            unique: true
        },
        sender: String,
        content: String,
        timestamp: String,
        channel: String,
    });
    return mongoose.model('Message', messageSchema);
}

export default create;