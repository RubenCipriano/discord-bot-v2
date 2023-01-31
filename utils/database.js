
const { MongoClient } = require('mongodb');
const compressor = require('lzutf8');
const username = process.env.USERDB
const password = process.env.PASSWORD
const uri = `mongodb+srv://${username}:${password}@cluster0.tldpqgh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    async getSettings(serverID) {
        await client.connect()
        const collection = client.db("rub1bot").collection("servers");
        var result = await collection.findOne({"server": serverID});
        if(!result) await collection.insertOne(result = {"server": serverID, "prefix": '-'});
        client.close();
        return result;
    },
    async updateSettings(serverID, prefix) {
        await client.connect()  
        const collection = client.db("rub1bot").collection("servers");
        var result = await collection.findOne({"server": serverID});
        if(!result) await collection.insertOne({"server": serverID, "prefix": '-'});
        result = await collection.updateOne({"server": serverID}, { $set: {'prefix': prefix} });
        client.close();
        return result;
    },
    async getPlaylist(user) {
        await client.connect()
        const collection = client.db("rub1bot").collection("users");
        var result = await collection.findOne({"id": user});
        if(!result) await collection.insertOne(result = {"id": user, playlist: ""})
        if(result.playlist != "") result.playlist = JSON.parse(compressor.decompress(result.playlist, {inputEncoding: "StorageBinaryString"}))
        client.close();
        return result;
    },
    async updatePlaylist(user, playlist) {
        await client.connect()
        const collection = client.db("rub1bot").collection("users");
        var result = await collection.findOne({"id": user});
        if(!result) await collection.insertOne(result = {"id": user, playlist: []})
        result = await collection.updateOne({"id": user}, { $set: {'playlist': playlist} });
        client.close();
        return result;
    },

}

