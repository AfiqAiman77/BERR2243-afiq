const MongoClient = require('mongodb').MongoClient;

async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        const startTime = Date.now(); // Record start time
        await client.connect();
        const endTime = Date.now(); // Record end time
        const duration = endTime - startTime;

        console.log("Connected to MongoDB!");
        console.log("Connection time:", duration, "ms");

        const db = client.db("testDB");
        const collection = db.collection("users");

        // Insert a document
        await collection.insertOne({ name: "Alice", age: 25 });
        console.log("Document inserted!");

        // Query the document
        const result = await collection.findOne({ name: "Alice" });
        console.log("Query result:", result);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

main();