import express from "express";
import { connectToDatabase  } from "../db.js";
import { ObjectId } from "mongodb";


const router = express.Router();

const db = await connectToDatabase();

let tasks = [
  {
    id: 1,
    naslov: "Kupiti kruh",
    opis: "Idi kupiti kruh danas",
    zavrsen: false,
    tags: ["hitno"]
  },
  {
    id: 2,
    naslov: "Naučiti Vue.js",
    opis: "Prouči malo Vue.js dokumentaciju",
    zavrsen: false,
    tags: ["hitno"]
  },
  {
    id: 3,
    naslov: "Riješi zadaću iz UPP-a",
    opis: "Please natjeraj se riješiti zadaću iz UPP-a, moraš i taj kolegij proći!",
    zavrsen: false,
    tags: ["pomalo"]
  },
];

/*router.get("/", async (req, res) => {
  res.status(200).json({ message: "OK" });
});*/
router.patch("/:id", async (req, res) => {
    const taskId = req.params.id;
    
    try {
      const result = await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { zavrsen: true } } 
      );
      
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Task kompletiran" });
      } else {
        res.status(404).json({ message: "Ni taska" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error ", error: error.message });
    }
  });
  


  
  router.get("/", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or invalid." });
      }
  
      const token = authHeader.split(" ")[1]; // Extract the token part after "Bearer"
  
      const decoded = await verifyJWT(token); // Verify the token
  
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token." });
      }
  
      // Assuming tasks contain a `userId` property to filter
      const userTasks = tasks.filter((task) => task.userId === decoded.id);
  
      res.json(userTasks);
    } catch (error) {
      console.error("Error processing GET /tasks:", error.message);
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  });
  


  router.delete("/:id", async (req, res) => {
    const taskId = req.params.id;
    
    try {
      const result = await db.collection("tasks").deleteOne({ _id: new ObjectId(taskId) });
      
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Task zbrisan" });
      } else {
        res.status(404).json({ message: "Ni taska" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error", error: error.message });
    }
  });


 // ovo tu mi nešto opako ni delalo, pa samo žešće konzultirali copilota 
  router.post("/", async (req, res) => {
    console.log("Primljen zahtjev na POST /tasks");

    let podaci = req.body;

    console.log("Podaci u body-u zahtjeva:", JSON.stringify(podaci, null, 2));

    if (!podaci || (Array.isArray(podaci) && podaci.length === 0)) {
        console.warn("Prazno tijelo zahtjeva primljeno.");
        return res.status(400).json({ greska: "Tijelo zahtjeva ne smije biti prazno." });
    }

    try {
        console.time("Vrijeme izvršavanja upisa u bazu");

        if (Array.isArray(podaci)) {
            const podaciSaTagovima = podaci.map(task => ({
                ...task,
                tags: task.tags && Array.isArray(task.tags) ? task.tags : [],
            }));

            console.log("Primljen array podataka s tagovima, pokrećem insertMany...");
            let result = await db.collection("tasks").insertMany(podaciSaTagovima);

            console.log(`Uspješno dodano ${result.insertedCount} dokumenata.`);
            res.status(201).json({
                poruka: "Uspješno dodano više dokumenata.",
                insertedCount: result.insertedCount,
                insertedIds: result.insertedIds,
            });
        } else {
            const noviZadatak = {
                ...podaci,
                tags: podaci.tags && Array.isArray(podaci.tags) ? podaci.tags : [],
            };

            console.log("Primljen jedan objekt s tagovima, pokrećem insertOne...");
            let result = await db.collection("tasks").insertOne(noviZadatak);

            console.log(`Uspješno dodan dokument sa ID: ${result.insertedId}.`);
            res.status(201).json({
                poruka: "Uspješno dodan dokument.",
                insertedId: result.insertedId,
            });
        }

        console.timeEnd("Vrijeme izvršavanja upisa u bazu");

    } catch (error) {
        console.error("Greška tijekom upisa u bazu:", error.message);
        console.debug("Detalji greške:", error);

        res.status(500).json({
            greska: "Dogodila se greška prilikom upisa podataka u bazu.",
            detalji: error.message,
        });
    } finally {
        console.log("Obrada zahtjeva POST /tasks završena.");
    }
});

export default router;
