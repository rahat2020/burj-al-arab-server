const express = require('express');
const password = 'alarab123';
const cors = require('cors');
const admin = require('firebase-admin');
var serviceAccount = require("./configs/burj-aal-arab-a46da-firebase-adminsdk-yaba0-9c91a593ad.json");
require('dotenv').config()
console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mptsi.mongodb.net/burj?retryWrites=true&w=majority`;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
// const uri = `mongodb+srv://burj-arab:alarab123@cluster0.mptsi.mongodb.net/burj?retryWrites=true&w=majority`;

const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
  res.send('hello this is working properly')

})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  // console.log(req.body);
  const bookings = client.db("burj").collection("alArab");
  // perform actions on the collection object
  console.log('database connected successfully')

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        //   console.log(result);
        res.send(result.insertedCount > 0);
      })
    // console.log(newBooking);
  })

  ///data receiving 
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          // const uid = decodedToken.uid;
          //  console.log({uid});
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          // console.log(tokenEmail, queryEmail);
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              })
          }
          else{
            res.status(404).send=('unauthorized access')
          }
        })
        .catch((error) => {
          res.status(404).send = ('unauthorized access')
        });
    }
    else {
      res.status(404).send = ('unauthorized access')
    }
    // console.log(req.query.email);
    // bookings.find({}) 

    // console.log(req.headers.authorization);
    //   bookings.find({email: req.query.email}) ///if u want to get the whole data then use this {}
    //  .toArray((err, documents) => {
    //       res.send(documents);
    //   })
  })
});
app.listen(3200);