import User from "../../src/models/userModel";
import { signToken } from "../controllers/authController";
import { v4 as uuidv4 } from "uuid";

export const createTestUserAndToken = async () => {
  const uniqueId = uuidv4(); // Generates unique 128-bit values
  let testUserId, token;

  try {
    // Create user
    const testUser = await User.create({
      name: "Test User",
      email: `test${uniqueId}@example.com`,
      password: "123456789",
      passwordConfirm: "123456789",
    });

    testUserId = testUser._id;
    token = signToken(testUserId);

    if (!token) {
      throw new Error("Token generation failed!");
    }

    return { testUserId, token };
  } catch (error) {
    console.error("Error trying to create test user and token.", error);
    throw error;
  }
};
