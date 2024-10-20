
// const { MongoClient, ServerApiVersion } = require('mongodb');
const url = "mongodb+srv://manvir98:manvir98@cluster0.ob343.mongodb.net/";

const mongoose = require('mongoose')


const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })