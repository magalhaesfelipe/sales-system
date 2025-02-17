import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import Service from "../../src/models/serviceModel.js";
import { signToken } from "../../src/controllers/authController.js";
import { afterAll, beforeAll, describe, expect, jest } from "@jest/globals";
import { createTestUserAndToken } from "../../src/utils/testUtils.js";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;

describe("Services API", () => {
  let testUserId, token;
  //let serviceId;

  beforeAll(async () => {
    try {
      // 1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected.");

      // 2. CREATE TEST USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());
      console.log("Test user id and token:", testUserId, token);
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS
  test("WHATEVER BROTHAR", async () => {
    expect(testUserId).toBeDefined();
    expect(token).toBeDefined();
  });

  // POST /servicos

  // GET /servicos

  // GET /servicos/:id

  // PUT /servicos/:id

  // DELETE /servicos/:id

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all Service tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);

    await mongoose.connection.close();
  });
});
