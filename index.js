const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello, Trip Ranger!')
})

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esrwv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("db connection success")

        // db name
        const database = client.db("tripRangerDB");

        // collection name or table name
        const toursCollection = database.collection("tours");
        const bookingCollection = database.collection("booking");

        // POST API, Add Tour Package
        app.post('/add-tour', async(req, res) => {
            const tours = req.body;
            const result = await toursCollection.insertOne(tours);
            res.send(result);
        });

        // GET API, get all Tour Package
        app.get('/tour-list', async(req, res) => {
            const cursor = toursCollection.find({});
            const result = await cursor.toArray(cursor);
            res.send(result)
        });

        // GET API, get all active Tour Package
        app.get('/active-tour-list', async(req, res) => {
            const cursor = toursCollection.find({ status: 'active' });
            const result = await cursor.toArray(cursor);
            res.send(result)
        });

        // GET API, get by ID Tour Package
        app.get('/tour/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toursCollection.findOne(query)
            res.send(result)
        });

        // PUT API, Update by ID Tour Package
        app.put('/update-tour/:id', async(req, res) => {
            const id = req.params.id;
            const tourUpdate = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    title: tourUpdate.title,
                    tour_date: tourUpdate.tour_date,
                    image_url: tourUpdate.image_url,
                    description: tourUpdate.description,
                    package_price: tourUpdate.package_price,
                    status: tourUpdate.status,
                    create_by: tourUpdate.create_by,
                    create_at: tourUpdate.create_at,
                },
            };
            const result = await toursCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        // Delete API, by ID Tour Package
        app.delete('/tour/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toursCollection.deleteOne(query);
            // if (result.deletedCount === 1) {
            //     console.log("Successfully deleted user.");
            // } else {
            //     console.log("No documents matched the query. Deleted 0 documents.");
            // }
            res.json(result)
        });

        // PUT API, change tour status 
        app.put('/update-tour-status/:id', async(req, res) => {
            const id = req.params.id;
            const statusUpdate = req.body;
            console.log(req)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    status: statusUpdate.status,
                },
            };
            const result = await toursCollection.updateOne(filter, updateDoc, options);
            const cursor = toursCollection.find({});
            const getResult = await cursor.toArray(cursor);
            res.send(getResult)
        });

        // ===========================================================================
        //         END TOUR API
        // ===========================================================================

        // POST API, Booking
        app.post('/booking', async(req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        // GET API, get all booking
        app.get('/booking-list', async(req, res) => {
            const cursor = bookingCollection.find({});
            const result = await cursor.toArray(cursor);
            res.send(result)
        });

        // GET API, get all by email Tour Package
        app.get('/my-booking/:id', async(req, res) => {
            const email = req.params.id;
            const cursor = bookingCollection.find({ email });
            const result = await cursor.toArray(cursor);
            res.send(result)
        });

        // Delete API, by ID booking Tour Package
        app.delete('/booking/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.json(result)
        });


        // PUT API, change status booking
        app.put('/update-booking-status/:id', async(req, res) => {
            const id = req.params.id;
            const statusUpdate = req.body;
            console.log(req)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    status: statusUpdate.status,
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            const cursor = bookingCollection.find({});
            const getResult = await cursor.toArray(cursor);
            res.send(getResult)
        });


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})