const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors());

const PORT = process.env.PORT || 3000;


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));


const dbdetails = {
    username: "admin1",
    password: "admin123",
    database: "heroku_j00txk4g",
    host: "ds133281.mlab.com",
    port: "33281",
}


//const URL = 'mongodb://127.0.0.1:27017/social_app';
const URL = 'mongodb://' + dbdetails.username + ':' + dbdetails.password + '@' + dbdetails.host + ':' + dbdetails.port + '/' + dbdetails.database;

mongoose.connect(URL, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('Error while Connecting!')
    } else {
        console.log('Connected to Mongo DB')
    }
})


const UserRoute = require('./routes/userRoute');
app.use('/user', UserRoute);

const PostRoute = require('./routes/postRoute');
app.use('/post', PostRoute);
app.get('/', function (req, res) {
    res.send("Welcome to Post-In")
})


app.listen(PORT, () => {
    console.log('Server Started on PORT ' + PORT)
})

