/**
 * Admin Seed Script
 * Run this ONCE to promote an existing user to admin role.
 *
 * Usage:
 *   node makeAdmin.js your-existing-user@email.com
 *
 * Run from the PROJECT ROOT folder:
 *   node makeAdmin.js admin@example.com
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });

const email = process.argv[2];

if (!email) {
    console.error("❌  Please provide an email address as argument.");
    console.error("    Usage: node makeAdmin.js user@example.com");
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: "user" },
    createdAt: Date,
});

const User = mongoose.model("User", userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅  Connected to MongoDB");

        const user = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            console.error(`❌  No user found with email: ${email}`);
        } else {
            console.log(`🎉  User "${user.name}" (${user.email}) is now an ADMIN!`);
        }
    } catch (err) {
        console.error("❌  Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
