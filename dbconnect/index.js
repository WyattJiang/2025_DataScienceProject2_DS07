//This code is to test connection to the database
const {MongoClient} = require('mongodb');
const username = 'zkoh0011';
const password = 'Amoskohzenyii';
async function main() {
    const url = "mongodb+srv://zkoh0011:Amoskohzenyii@cluster0.einni.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(url);
try{
    await client.connect();

await listDatabases(client);}
    catch (e) {
        console.error(e);
    } finally {
        await client.close();   
}

}
main().catch(console.error);

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

