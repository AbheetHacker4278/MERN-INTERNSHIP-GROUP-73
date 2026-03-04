/**
 * Admin Seed Script — writes directly to the RESERVATIONS database
 * (same DB the backend uses via dbName: "RESERVATIONS" in dbConnection.js)
 *
 * Run: node seedAdmin.js
 *
 * Credentials:
 *   Email   : admin@gmail.com
 *   Password: 123456
 */
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import bcryptjs from "bcryptjs";

dotenv.config({ path: "./config.env" });

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";
const ADMIN_NAME = "Admin";

async function run() {
    // Strip the DB name from the URI and explicitly use RESERVATIONS
    const baseURI = process.env.MONGO_URI?.trim().replace(/["']/g, "");

    if (!baseURI) {
        console.error("❌  MONGO_URI not found in config.env");
        process.exit(1);
    }

    // Build connection string pointing to the RESERVATIONS database
    // Replace the database path in the URI (everything between last / and ?)
    const uri = baseURI.replace(
        /(mongodb(?:\+srv)?:\/\/[^/]+\/)([^?]*)(.*)/,
        "$1RESERVATIONS$3"
    );

    console.log("🔗  Connecting to RESERVATIONS database...");

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅  Connected to MongoDB (RESERVATIONS)");

        const db = client.db("RESERVATIONS");
        const users = db.collection("users");

        // Hash the password
        const hashed = await bcryptjs.hash(ADMIN_PASSWORD, 10);

        // Self-test the hash before writing
        const selfTest = await bcryptjs.compare(ADMIN_PASSWORD, hashed);
        if (!selfTest) throw new Error("bcrypt self-test failed!");
        console.log("✅  Hash self-test passed");

        // Upsert admin user
        const result = await users.updateOne(
            { email: ADMIN_EMAIL },
            {
                $set: {
                    name: ADMIN_NAME,
                    email: ADMIN_EMAIL,
                    password: hashed,
                    role: "admin",
                },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true }
        );

        const action = result.upsertedCount > 0 ? "Created" : "Updated";
        console.log(`🎉  ${action} admin user in RESERVATIONS.users`);

        // Post-write verification
        const saved = await users.findOne({ email: ADMIN_EMAIL });
        const finalOk = await bcryptjs.compare(ADMIN_PASSWORD, saved.password);
        console.log(`✅  DB verification: bcrypt.compare("${ADMIN_PASSWORD}", storedHash) → ${finalOk}`);

        if (finalOk) {
            console.log(`\n═══════════════════════════════════\n`);
            console.log(`  ✅  Admin account is ready!\n`);
            console.log(`  Email   : ${ADMIN_EMAIL}`);
            console.log(`  Password: ${ADMIN_PASSWORD}`);
            console.log(`  Role    : admin`);
            console.log(`\n═══════════════════════════════════\n`);
        } else {
            console.error("❌  Verification failed — please try again.");
        }

    } catch (err) {
        console.error("❌  Error:", err.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}

run();
