export const commands = {
    "avatar":{
        "args": ["avatar"],
        "admin": false,
        "self": true,
        "exec": async (args, db) => {
            let user = await db.models.User.findOne({ id: args[0].id });
            if (!user) return false;
            console.log(user)
            user.avatar = args[1];
            user.save();
            return true;
        }
    },
    "ban":{
        "args": ["user"],
        "admin": true,
        "exec": async (args, db) => {
            let user = await db.models.User.findOne({ username: args[0] });
            if (!user) return false;
            user.banned = true;
            user.save();
            return true;
        }
    },
    "mute":{
        "args": ["user"],
        "admin": true,
        "exec":async (args, db) => {
            let user = await db.models.User.findOne({ username: args[0] });
            if (!user) return false;
            user.muted = true;
            user.save();
            return true;
        }
    },
    "unmute":{
        "args": ["user"],
        "admin": true,
        "exec": async (args, db) => {
            let user = await db.models.User.findOne({ username: args[0] });
            if (!user) return false;
            user.muted = false;
            user.save();
            return true;
        }
    },
    "unban":{
        "args": ["user"],
        "admin": true,
        "exec": async (args, db) => {
            let user = await db.models.User.findOne({ username: args[0] });
            if (!user) return false;
            user.banned = false;
            user.save();
            return true;
        }
    },
    "newchannel":{
        "args": ["name", "description"],
        "admin": true,
        "exec": async (args, db) => {
            const channel = new db.models.Channel({
                id: Date.now().toString(),
                name: args.name,
                description: args.description,
                messages: [],
            });
            channel.save();
            return true;
        }
    },
    "deletechannel":{
        "args": ["channel"],
        "admin": true,
        "exec": async (args, db) => {
            let channel = await db.models.Channel.findOne({ id: args[0] });
            await channel.remove();
            return true;

        }
    },
    "renamechannel":{
        "args": ["channel", "name"],
        "admin": true,
        "exec": async (args, db) => {
            let channel = await db.models.Channel.findOne({ id: args[0] });
            if (!channel) return false;
            channel.name = args.name;
            channel.save();
            return true;
        }
    },
    "help":{
        "args": [],
        "admin": false,
        "exec": (args, db) => {
            return Object.keys(commands);
        }
    }
}

export const runCommand = async (runner, command, args, db) => {
    if (commands[command]) {
        let newargs = [runner, ...args]
        if (commands[command].admin) {
            let user = await db.models.User.findOne({ id: newargs[0] });
            if (!user) return false;
            if (user.rank !== "admin") return false;
        }
        return commands[command].exec(newargs, db);
    } else {
        return false;
    }
}