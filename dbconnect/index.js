// //this is the code to test the conncetion
// const {MongoClient} = require('mongodb');
// const username = 'zkoh0011';
// const password = 'Amoskohzenyii';
// async function main() {
//     const url = "mongodb+srv://zkoh0011:Amoskohzenyii@cluster0.einni.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";
//
//     const client = new MongoClient(url);
// try{
//     await client.connect();
//
// await listDatabases(client);}
//     catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
// }
//
// }
// main().catch(console.error);
//
// async function listDatabases(client){
//     databasesList = await client.db().admin().listDatabases();
//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };
//

//this code shows the data within the database to make sure mongodb is conncted
const { MongoClient } = require('mongodb');

const username = 'zkoh0011';
const password = 'Amoskohzenyii';

async function main() {
    const url = "mongodb+srv://zkoh0011:Amoskohzenyii@cluster0.einni.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(url);

    try {
        await client.connect();

        // Call listMovies, not listDatabases
        await listMovies(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function listMovies(client) {
    const collection = client.db("sample_mflix").collection("movies");

    const movies = await collection.find({}).limit(10).toArray();

    console.log("Sample Movies from sample_mflix:");
    movies.forEach((movie, i) => {
        console.log(`${i + 1}. ${movie.title} (${movie.year})`);
    });
}