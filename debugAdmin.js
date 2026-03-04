/**
 * Debug script: verifies admin@gmail.com exists in DB and password matches.
 * Run: node debugAdmin.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

dotenv.config({ path: "./config.env" });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB");

    const col = mongoose.connection.collection("users");
    const user = await col.findOne({ email: "admin@gmail.com" });

    if (!user) {
        console.log("❌  No user found with email admin@gmail.com");
        process.exit(1);
    }

    console.log("\n📋  User found:");
    console.log("    _id      :", user._id);
    console.log("    name     :", user.name);
    console.log("    email    :", user.email);
    console.log("    role     :", user.role);
    console.log("    password :", user.password ? user.password.substring(0, 20) + "..." : "MISSING");

    if (!user.password) {
        console.log("\n❌  Password field is missing in DB record!");
        process.exit(1);
    }

    const match123456 = await bcryptjs.compare("123456", user.password);
    const matchAdmin123 = await bcryptjs.compare("Admin@123", user.password);

    console.log("\n🔐  Password comparisons:");
    console.log(`    bcryptjs.compare("123456",    hash)  → ${match123456}`);
    console.log(`    bcryptjs.compare("Admin@123", hash)  → ${matchAdmin123}`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
