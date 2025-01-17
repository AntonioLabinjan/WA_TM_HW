import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectToDatabase } from "../db.js"; // Assumes you have a module for database connection

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to the database
const db = await connectToDatabase();
const usersCollection = db.collection("users");

// Function to hash the password
async function hashPassword(plainPassword, saltRounds) {
  try {
    let hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
  } catch (err) {
    console.error(`Error hashing password: ${err}`);
    return null;
  }
}

// Function to check the password
async function checkPassword(plainPassword, hashedPassword) {
  try {
    let result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
  } catch (err) {
    console.error(`Error comparing passwords: ${err}`);
    return false;
  }
}

// Function to generate JWT
async function generateJWT(payload) {
  try {
    let token = jwt.sign(payload, JWT_SECRET);
    return token;
  } catch (err) {
    console.error(`Error generating JWT: ${err}`);
    return null;
  }
}

// Function to verify JWT
async function verifyJWT(token) {
  try {
    let decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(`Error verifying JWT: ${err}`);
    return null;
  }
}

// Route for user registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required!" });
  }

  // Check if the username already exists
  const existingUser = await usersCollection.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists!" });
  }

  // Hash the password
  const hashed_password = await hashPassword(password, 10);
  if (!hashed_password) {
    return res.status(500).send("Error hashing password!");
  }

  // Create a new user object
  const newUser = { username, password: hashed_password };

  // Add the user to the database
  try {
    const result = await usersCollection.insertOne(newUser);
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: result.insertedId, username: newUser.username },
    });
  } catch (err) {
    console.error(`Error inserting user into database: ${err}`);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = await usersCollection.findOne({ username });
  if (!user) {
    return res.status(401).send('Authentication failed!'); // Do not reveal user existence
  }

  // Check if the password is correct
  const isPasswordCorrect = await checkPassword(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).send('Authentication failed!'); // Do not reveal incorrect password
  }

  // Generate JWT
  let token = await generateJWT({ id: user._id, username: user.username });
  if (!token) {
    return res.status(500).json({ message: "Error generating token" });
  }

  return res.status(200).json({ jwt_token: token });
});

export default router;
export { verifyJWT, generateJWT, checkPassword, hashPassword };
