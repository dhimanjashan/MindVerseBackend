import mongoose from "mongoose";

let isConnected = false;

export async function connectToMongo(uri = "mongodb://localhost:27017/Thoughtify") {
    if (isConnected) return mongoose.connection;
    await mongoose.connect(uri);
    isConnected = true;
    return mongoose.connection;
}


