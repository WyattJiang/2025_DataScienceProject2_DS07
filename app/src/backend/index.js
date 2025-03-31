const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const PORT = 3001;
const uri = "mongodb+srv://zkoh0011:{password}@cluster0.einni.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

app.get('/movies', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db("sample_mflix").collection("movies");
        const movies = await collection.find().limit(10).toArray();
        res.json(movies);
    } catch (err) {
        console.error("Failed to fetch movies", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});
//currently updated sample_mflix first to localhost 3001 until data gathered from sources.
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}/movies`);
});
