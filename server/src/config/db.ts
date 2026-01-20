import mongoose from 'mongoose';

let isMemoryMode = false;
export const getMemoryMode = () => isMemoryMode;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/litergames', {
            serverSelectionTimeoutMS: 2000 // Fail fast if no mongo (2s)
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Failed. Switching to In-Memory Mode (Data will not save).`);
        // console.error(error); // Optional: verbose log
        isMemoryMode = true;
    }
};

export default connectDB;
