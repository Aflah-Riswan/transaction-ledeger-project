import mongoose from "mongoose";

export async function connectDatabase () :Promise<void> {
  const mongoUrl = process.env.MONGO_URI
  if(!mongoUrl){
    throw new Error('MONGO_URI is missing from the environment variables')
  }
  await mongoose.connect(mongoUrl)
  console.log("MongoDb connected")
}