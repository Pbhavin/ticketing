import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
    var signup: () => string[];
}

let mongo: any;
jest.mock('../nats-wrapper.ts');
beforeAll(async () => {
    process.env.JWT_KEY = 'abcd';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signup = () => {
    // build payload
    const id = new mongoose.Types.ObjectId().toHexString();
    const payload = {
        id: id,
        email: 'test@test.com',
    };

    // create JWT from payload
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // build session object
    const session = {
        jwt: token,
    };

    //trun session to json
    const sessionJSON = JSON.stringify(session);

    // encode JSON to base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return string as a cookie
    return [`session=${base64}`];
};
