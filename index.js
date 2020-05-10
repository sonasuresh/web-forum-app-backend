const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const cors = require('cors')
app.use(cors({ origin: 'http://localhost:3000' }));
const mongoose = require('mongoose')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));



//const URL = 'mongodb://127.0.0.1:27017/social_app';
const URL = 'mongodb+srv://sona:Godisgreat123%23@cluster0-nap9e.mongodb.net/test'

mongoose.connect(URL, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('Error while Connecting!')
    } else {
        console.log('Connected to Mongo DB')
    }
})

app.use('/', express.static('./build'));

const UserRoute = require('./routes/userRoute');
app.use('/user', UserRoute);

const PostRoute = require('./routes/postRoute');
app.use('/post', PostRoute);


app.listen(4000, () => {
    console.log('Server Started on PORT ' + 3000)
})