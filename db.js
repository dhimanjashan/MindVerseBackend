import mongoose from "mongoose";

let isConnected = false;

export async function connectToMongo(uri = process.env.MindVerse_DB_URI) {
    if (isConnected) return mongoose.connection;
    await mongoose.connect(uri);
    isConnected = true;
    return mongoose.connection;
}


