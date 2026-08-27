const dns = require('node:dns');
dns.setServers(['1.1.1.1', '1.0.0.1']); 

const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId,   } = require("mongodb");
dontenv.config();

const uri = process.env.MONGO_URI;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  }),
);
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("property-assignment");
    const housesCollection = db.collection("houses");

    // get api for all houses
    app.get("/houses", async(req, res) =>{
      const result = await housesCollection.find().toArray();
      res.send(result);
    })

    // get single house details
    app.get("/houses/:id", async(req, res) => {
      const id =  req.params.id;
      const query = {
        _id: new ObjectId(id)
      };
      const house = await housesCollection.findOne(query);  
      res.send(house)
    })


   
 

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
