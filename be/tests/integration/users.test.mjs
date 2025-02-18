import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import { afterAll, beforeAll, describe, expect, jest } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";
import { getExampleNumber } from "libphonenumber-js";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;
const uniqueId = uuidv4();

describe("Users API", () => {
  let testUserId, userToken;

  beforeAll(async () => {
    try {
      // 1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected in Users API test.");
    } catch (error) {
      console.log("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS
  test("'POST /signup' should return a new User document", async () => {
    const userData = {
      name: "Test",
      email: "test@example.com",
      password: "123456789",
      passwordConfirm: "123456789",
    };

    const userResponse = await request(app)
      .post("/api/users/signup")
      .send(userData);

    testUserId = userResponse.body.data._id;
    userToken = userResponse.body.token;

    expect(userResponse.status).toBe(201);
    expect(userResponse.body).toHaveProperty("token");
  });

  test("'POST /login' should log in the User and return a JWT", async () => {
    const loginData = {
      email: "test@example.com",
      password: "123456789",
    };

    const userResponse = await request(app)
      .post("/api/users/login")
      .send(loginData);

    expect(userResponse.status).toBe(200);
    expect(userResponse.body).toHaveProperty("token");
  });

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all User tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);

    await mongoose.connection.close();
  });
});
