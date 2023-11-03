import { app } from './app';
import mongoose from 'mongoose';
const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT KEY Needs to be defined!!');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO URI Needs to be defined!!');
    }
    try {
        console.log('Starting Auth-DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Auth-DB started.');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log(`Listening on port 3000!!`);
    });
};

start();
