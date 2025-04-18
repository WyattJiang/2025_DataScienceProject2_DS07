const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const PORT = 3001;
const uri = "mongodb+srv://zkoh0011:Amoskohzenyii@cluster0.einni.mongodb.net/suburb?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

function restructureByYearSeason(doc) {
    const { SAL_NAME21, STE_NAME21, _id, ...rest } = doc;
    const yearSeasonMap = {};

    for (const [key, value] of Object.entries(rest)) {
        // Skip non-metric fields
        if (key === 'Unname' || key === 'tmax') continue;

        // Parse the key pattern: tmax_2000_summer_tmax or similar
        const parts = key.split('_');
        if (parts.length < 4) continue;

        const metricType = parts[0]; // tmax, tmin, or precip
        const year = parts[1];
        const season = parts[2].charAt(0).toUpperCase() + parts[2].slice(1).toLowerCase();
        const metric = parts[3]; // Should match metricType (tmax, tmin, precip)

        if (!yearSeasonMap[year]) yearSeasonMap[year] = { year: parseInt(year) };
        if (!yearSeasonMap[year][season]) yearSeasonMap[year][season] = {};

        yearSeasonMap[year][season][metricType] = value;
    }

    // Convert the map to an array of objects
    return Object.values(yearSeasonMap).map(yearData => ({
        SAL_NAME21,
        STE_NAME21,
        year: yearData.year,
        ...Object.fromEntries(
            Object.entries(yearData)
                .filter(([key]) => key !== 'year')
                .map(([season, metrics]) => [season, metrics])
        )
    }));
}

app.get('/seasonal-data', async (req, res) => {
    const suburbName = req.query.suburb;
    try {
        await client.connect();
        const db = client.db("suburb");

        const query = suburbName
            ? { SAL_NAME21: { $regex: suburbName, $options: 'i' } }
            : {};

        const data = await db.collection("combined_season").find(query).limit(100).toArray();

        const reshaped = data.flatMap(restructureByYearSeason);

        await client.close();
        res.json(reshaped);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Failed to fetch seasonal data." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}/seasonal-data`);
});