const mongoose = require('mongoose')
var moment = require('moment')

// const CommentReplySchema = mongoose.Schema({
//     username: String,
//     commentdate: {
//         type: Date,
//         default: Date.now()
//     },
//     commentcontent: String
// })

const CommentSchema = mongoose.Schema({
    username: String,
    commentcontent: String,
    commentdate: {
        type: Date,
        default: moment()
    }
})

const PostSchema = mongoose.Schema({
    postcontent: String,
    posttitle: String,
    likes: {
        type: Number,
        default: 0
    },
    users: [],
    createdAt: {
        type: Date,
        default: moment()
    },
    postimageid: String,
    owner: String,
    comments: [CommentSchema]
})

module.exports = mongoose.model('Post', PostSchema)