function create(mongoose){
    const channelSchema = new mongoose.Schema({
        id: {
            type: String,
            unique: true
        },
        name: String,
        description: String,
        messages: Array,
    });
    return mongoose.model('Channel', channelSchema);
}

export default create;