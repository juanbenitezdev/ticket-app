import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51Im6w3D2XuBvzIMzKCcmKYlomQqP9wHRleZVxoUSCch2PAoNWJAm6DTRFZr1TnaqQWL3tkEiCUvUlFrploqCvLWE00veA4GnTZ";

let mongo: any;
beforeAll(async () => {
  // Runs before all test

  process.env.JWT_KEY = "asdasd";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // Runs before each test
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload {id, email}
  const paylod = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create the JWT
  const token = jwt.sign(paylod, process.env.JWT_KEY!);

  // Build a session object. {jwt: MY_JWT}
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string that is the cookie with the encode data
  return [`express:sess=${base64}`];
};
