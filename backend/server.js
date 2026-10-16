import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import "dotenv/config";
import jwt from "jsonwebtoken";
import fs from "node:fs";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Check database configuration without printing secrets
console.log("DB host:", process.env.DB_HOST);
console.log("DB port:", process.env.DB_PORT);
console.log("DB user configured:", Boolean(process.env.DB_USER));
console.log("DB name configured:", Boolean(process.env.DB_NAME));
console.log("DB password configured:", Boolean(process.env.DB_PASSWORD));

// Connect to MySQL
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(
            new URL("./certs/ca.pem", import.meta.url),
            "utf8"
        ),
        rejectUnauthorized: true,
    },
});

console.log("MySQL connected successfully!");

// Verify whether the admin is logged in
function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in first",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required",
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

// Health check
app.get("/", (req, res) => {
    res.send("SmartCRM backend is running!");
});

// Admin password-only login
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;

    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "Admin login is not configured",
        });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Invalid password",
        });
    }

    const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    return res.json({
        message: "Login successful",
        token,
    });
});

// Public customer form: save a lead
app.post("/api/leads", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            service,
            requirements,
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        const sql = `
            INSERT INTO leads
            (name, email, phone, service, requirements)
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            name,
            email,
            phone || null,
            service || null,
            requirements || null,
        ];

        const [result] = await db.execute(sql, values);

        return res.status(201).json({
            message: "Lead saved successfully!",
            leadId: result.insertId,
        });
    } catch (error) {
        console.error("Database error:", error.message);

        return res.status(500).json({
            message: "Failed to save lead",
        });
    }
});

// Protected route: retrieve all leads
app.get("/api/leads", verifyAdmin, async (req, res) => {
    try {
        const [leads] = await db.execute(
            "SELECT * FROM leads ORDER BY created_at DESC"
        );

        return res.status(200).json(leads);
    } catch (error) {
        console.error("Database error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve leads",
        });
    }
});

// Protected route: update a lead's status
app.patch("/api/leads/:id/status", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "New",
            "Contacted",
            "Converted",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid lead status",
            });
        }

        const [result] = await db.execute(
            "UPDATE leads SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Lead not found",
            });
        }

        return res.status(200).json({
            message: "Lead status updated successfully",
        });
    } catch (error) {
        console.error("Database error:", error.message);

        return res.status(500).json({
            message: "Failed to update lead status",
        });
    }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCRM backend is running on port ${PORT}`);
});