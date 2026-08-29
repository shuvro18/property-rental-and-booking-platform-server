const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const commentCollection = db.collection("comments");
    const favoriteCollection = db.collection("favorite");
    const bookingCollection = db.collection("bookings");

    // get api for all houses
    app.get("/houses", async (req, res) => {
      const result = await housesCollection.find().toArray();
      res.send(result);
    });

    // get api for bookings tenant
    app.get("/bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    // get favorite

    app.get("/favorites", async (req, res) => {
      const result = await favoriteCollection.find().toArray();
      res.send(result);
    });

    // delete from favorite button
    app.delete("/favorite/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    

    // add comment in commentCollection
    app.post("/comments", async (req, res) => {
      const data = req.body;
      const result = await commentCollection.insertOne(data);
      res.send(result);
    });

    // add to favorite collection
    app.post("/favorites", async (req, res) => {
      const data = req.body;
      const { userId, propertyId } = req.body;

      const existFavorite = await favoriteCollection.findOne({
        userId,
        propertyId,
      });
      if (existFavorite) {
        return res
          .status(400)
          .send({ message: "You already added it to favorite" });
      }
      const result = await favoriteCollection.insertOne(data);
      res.send(result);
    });

    // add a booking in bookingCollection
    app.post("/bookings", async (req, res) => {
      const data = req.body;
      const { userId, propertyId } = req.body;
      const isExist = await bookingCollection.findOne({
        userId,
        propertyId,
      });
      if (isExist) {
        return res.status(404).send({ message: "You already booked it" });
      }
      const result = await bookingCollection.insertOne(data);
      res.send(result);
    });

    // get comment

    app.get("/comment", async (req, res) => {
      const result = await commentCollection.find().toArray();
      res.send(result);
    });

    // get single house details
    app.get("/houses/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const house = await housesCollection.findOne(query);
      res.send(house);
    });

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
