const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: String,
    password: String,
    email: String,
    profileimageid: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('User', UserSchema);