const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const PORT = 3001;
const uri = "mongodb+srv://zkoh0011:Amoskohzenyii@cluster0.einni.mongodb.net/suburb?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let db; // Persistent DB connection

async function connectToMongo() {
    if (!db) {
        await client.connect();
        db = client.db("suburb");
        console.log("✅ MongoDB connected");
    }
}

connectToMongo();

app.get('/', (req, res) => {
    res.send('Climates API is running. Use /seasonal-data or /api/suburbs');
});

function restructureByYearSeason(doc) {
    const { SAL_NAME21, STE_NAME21, _id, ...rest } = doc;
    const yearSeasonMap = {};

    for (const [key, value] of Object.entries(rest)) {
        if (key === 'Unname') continue;
        const parts = key.split('_');
        if (parts.length < 4) continue;

        const metricType = parts[0];
        const year = parts[1];
        const season = parts[2].charAt(0).toUpperCase() + parts[2].slice(1).toLowerCase();

        if (!yearSeasonMap[year]) {
            yearSeasonMap[year] = {
                SAL_NAME21,
                STE_NAME21,
                year: parseInt(year),
                Summer: {},
                Autumn: {},
                Winter: {},
                Spring: {}
            };
        }

        if (yearSeasonMap[year][season]) {
            yearSeasonMap[year][season][metricType] = value;
        }
    }

    return Object.values(yearSeasonMap);
}

function stateNameFromAbbreviation(abbr) {
    const stateMap = {
        'ACT': 'Australian Capital Territory',
        'NSW': 'New South Wales',
        'NT': 'Northern Territory',
        'QLD': 'Queensland',
        'SA': 'South Australia',
        'TAS': 'Tasmania',
        'VIC': 'Victoria',
        'WA': 'Western Australia',
        'Vic.': 'Victoria',
        'Qld': 'Queensland',
        'N.S.W': 'New South Wales',
        'S.A': 'South Australia'
    };

    return stateMap[abbr] || abbr;
}

// In index.js, modify the /seasonal-data endpoint:
app.get('/seasonal-data', async (req, res) => {
    let suburbName = req.query.suburb || "";
    const stateMatch = suburbName.match(/\((.*?)\)$/);
    const state = stateMatch ? stateMatch[1] : null;
    const suburbNameNoState = suburbName.replace(/\s*\(.*?\)\s*$/, '').trim();

    try {
        let query = {};
        if (suburbName) {
            if (state) {
                query = {
                    $and: [
                        { SAL_NAME21: { $regex: `^${suburbNameNoState}($|\\s*\\()` } },
                        { STE_NAME21: { $regex: stateNameFromAbbreviation(state), $options: 'i' } }
                    ]
                };
            } else {
                query = { SAL_NAME21: { $regex: `^${suburbNameNoState}($|\\s*\\()` } };
            }
        }

        const data = await db.collection("combined_season").find(query).limit(100).toArray();
        const reshaped = data.flatMap(restructureByYearSeason).slice(0, 20);

        res.json(reshaped);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Failed to fetch seasonal data." });
    }
});

app.get('/api/suburbs', async (req, res) => {
    try {
        const suburbs = await db.collection("combined_season")
            .aggregate([
                { $group: { _id: { name: "$SAL_NAME21", state: "$STE_NAME21" } } },
                { $project: { _id: 0, name: "$_id.name", state: "$_id.state" } },
                { $sort: { name: 1 } } // Sort alphabetically by suburb name
            ])
            .toArray();

        // Add a displayName field for the dropdown that includes the state
        const suburbsWithDisplay = suburbs.map(s => ({
            ...s,
            displayName: `${s.name} (${s.state})`
        }));

        res.json(suburbsWithDisplay);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Failed to fetch suburbs." });
    }
});

app.get('/trend-graph', async (req, res) => {
    const suburb = req.query.suburb;
    const metric = req.query.metric || "tmax";
    const season = req.query.season || "Summer";

    if (!suburb) {
        return res.status(400).json({ error: "Missing required query param: suburb" });
    }

    try {
        const results = await db.collection("combined_season")
            .find({ SAL_NAME21: { $regex: suburb, $options: 'i' } })
            .limit(100)
            .toArray();

        const flattened = results.map(doc => ({
            year: doc.year,
            value: doc[season]?.[metric] ?? null
        })).filter(e => e.value !== null);

        res.json(flattened);
    } catch (err) {
        console.error("❌ Error in /trend-graph:", err);
        res.status(500).json({ error: "Failed to fetch trend graph data." });
    }
});

// Add this to index.js
app.get('/api/trend-data', async (req, res) => {
    const { suburb, metric = 'tmax', season = 'Summer', yearRange = 10 } = req.query;
    const currentYear = new Date().getFullYear();
    const yearCutoff = currentYear - yearRange;

    // Extract both suburb name and state
    const stateMatch = suburb ? suburb.match(/\((.*?)\)$/) : null;
    const state = stateMatch ? stateMatch[1] : null;
    const suburbNameNoState = suburb ? suburb.replace(/\s*\(.*?\)\s*$/, '').trim() : "";

    try {
        let query = {};

        if (suburb) {
            if (state) {
                query = {
                    $and: [
                        { SAL_NAME21: { $regex: `^${suburbNameNoState}($|\\s*\\()` } },
                        { STE_NAME21: { $regex: stateNameFromAbbreviation(state), $options: 'i' } }
                    ]
                };
            } else {
                query = { SAL_NAME21: { $regex: `^${suburbNameNoState}($|\\s*\\()` } };
            }
        }

        const data = await db.collection("combined_season").find(query).limit(100).toArray();

        // Process the data with the year filtering
        const reshaped = data
            .flatMap(restructureByYearSeason)
            .filter(entry => entry.year >= yearCutoff && entry.year <= currentYear)
            .sort((a, b) => a.year - b.year);

        console.log(`Year range filter: ${yearCutoff}-${currentYear}, found ${reshaped.length} entries`);

        res.json(reshaped);
    } catch (err) {
        console.error("❌ Error in /api/trend-data:", err);
        res.status(500).json({ error: "Failed to fetch trend data." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

// // Optional: Close Mongo connection when app exits
// process.on('SIGINT', async () => {
//     console.log('🔌 Closing MongoDB connection...');
//     await client.close();
//     process.exit(0);
// });
