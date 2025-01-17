import express from "express";
import { connectToDatabase } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const db = await connectToDatabase();

// Helper funkcija za dohvaćanje kolekcije specifične za korisnika
const getUserCollection = (userId) => db.collection(`tasks_${userId}`);

async function verifyJWT(token) {
  try {
    let decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error(`Error verifying JWT: ${err}`);
    return null;
  }
};

// PATCH: Oznaka zadatka kao završen
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ greska: "Autorizacija nije prisutna ili je neispravna." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ greska: "Neispravan JWT token." });
    }

    try {
        const userId = decoded.id;
        const userCollection = getUserCollection(userId);

        const result = await userCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { zavrsen: true } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: "Task kompletiran" });
        } else {
            res.status(404).json({ message: "Task nije pronađen" });
        }
    } catch (error) {
        res.status(500).json({ greska: "Dogodila se greška.", detalji: error.message });
    }
});

// GET: Dohvati sve zadatke korisnika
router.get("/", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ greska: "Autorizacija nije prisutna ili je neispravna." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ greska: "Neispravan JWT token." });
    }

    try {
        const userId = decoded.id;
        const userCollection = getUserCollection(userId);

        const tasks = await userCollection.find({}).toArray();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ greska: "Dogodila se greška prilikom dohvaćanja taskova.", detalji: error.message });
    }
});

// DELETE: Brisanje zadatka
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ greska: "Autorizacija nije prisutna ili je neispravna." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ greska: "Neispravan JWT token." });
    }

    try {
        const userId = decoded.id;
        const userCollection = getUserCollection(userId);

        const result = await userCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Task zbrisan" });
        } else {
            res.status(404).json({ message: "Task nije pronađen" });
        }
    } catch (error) {
        res.status(500).json({ greska: "Dogodila se greška.", detalji: error.message });
    }
});

// POST: Dodavanje novog zadatka
router.post("/", async (req, res) => {
    const podaci = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ greska: "Autorizacija nije prisutna ili je neispravna." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyJWT(token);

    if (!decoded) {
        return res.status(401).json({ greska: "Neispravan JWT token." });
    }

    try {
        const userId = decoded.id;
        const userCollection = getUserCollection(userId);

        const noviZadatak = {
            ...podaci,
            tags: podaci.tags && Array.isArray(podaci.tags) ? podaci.tags : [],
            createdAt: new Date(),
        };

        const result = await userCollection.insertOne(noviZadatak);

        res.status(201).json({
            poruka: "Task uspješno dodan.",
            insertedId: result.insertedId,
        });
    } catch (error) {
        res.status(500).json({ greska: "Dogodila se greška prilikom dodavanja taska.", detalji: error.message });
    }
});

export default router;
