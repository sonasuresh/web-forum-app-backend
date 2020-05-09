const Post = require('../models/postModel')
const crypto = require('crypto')
const path = require('path')
const AWS = require('aws-sdk');
var multer = require('multer')
const config = require('../config/config')

const aws = config.aws;

const s3Client = new AWS.S3({
    accessKeyId: aws.accesskey,
    secretAccessKey: aws.secretkey,
    region: aws.region,
});

const awsUploadParams = {
    Bucket: aws.bucket + '/' + aws.postimages,
};


const awsDownloadParams = {
    Bucket: aws.bucket + '/' + aws.postimages,
};

var storage = multer.memoryStorage()
var postupload = multer({ storage: storage }).single('file');

function postImageDownload(req, res) {
    awsDownloadParams.Key = req.params.file;
    s3Client.getObject(awsDownloadParams)
        .createReadStream()
        .on('error', function (err) {
            console.log("Error  " + err);
        }).pipe(res);
}
function uploadPostPictureToAws(req, res) {
    const hashBody = {
        file: req.file
    }
    awsUploadParams.Key = crypto.createHash('sha1').update(JSON.stringify(hashBody)).digest('hex') + ".png";
    awsUploadParams.Body = req.file.buffer;
    try {
        s3Client.upload(awsUploadParams, (err, data) => {
            if (!err) {
                console.log('Post Image uploaded successfully !!' + req.file.originalname)
            }
        });
    } catch (error) {
        console.log('Error in Uploading the file ' + error)
    }

}

async function addPost(req, res) {
    try {
        const { postcontent, posttitle, username } = req.body

        if (typeof postcontent == 'undefined' && typeof posttitle == 'undefined' && typeof username == 'undefined') {
            throw new Error('Incomplete details to create new Post')
        }
        else {
            let newPost = new Post({
                postcontent: postcontent,
                posttitle: posttitle,
                owner: username
            })
            if (req.file != undefined) {
                uploadPostPictureToAws(req, res)
                const hash = {
                    file: req.file
                    // fieldname: req.file.fieldname,
                    // originalname: req.file.originalname,
                    // encoding: req.file.encoding,
                    // mimetype: req.file.mimetype
                }
                newPost['postimageid'] = crypto.createHash('sha1').update(JSON.stringify(hash)).digest('hex');
                await newPost.save((err, docs) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: 'DB Error'
                        })
                    } else {
                        res.status(200).send({
                            success: true,
                            message: 'Post Created!'
                        })
                    }
                })
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Bad Request!Image missing!'
                })
            }

        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }

}

async function getPosts(req, res) {
    try {
        await Post.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            }
            else {
                if (docs.length > 0) {
                    res.status(200).send({
                        success: true,
                        message: docs
                    })
                } else {
                    res.status(204).send({
                        success: true,
                        message: 'No Posts'
                    })
                }
            }
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function getPostsBasedOnUser(req, res) {
    try {
        const user = req.params.name
        await Post.find({ owner: user }).sort({ createdAt: -1 }).exec((err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            }
            else {
                if (docs.length > 0) {
                    res.status(200).send({
                        success: true,
                        message: docs
                    })
                } else {
                    res.status(204).send({
                        success: true,
                        message: 'No Posts'

                    })
                }
            }
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function deletePosts(req, res) {
    try {
        const { id } = req.params;
        if (typeof id == 'undefined') {
            res.status(400).send({
                success: false,
                message: 'Id is missing!'
            })
        } else {
            await Post.deleteOne({ _id: id }, (err, docs) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: 'DB Error'
                    })
                } else {
                    res.status(200).send({
                        success: true,
                        message: 'Post Deleted!'
                    })
                }
            })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function likePost(req, res) {
    try {
        const { id, username } = req.body;
        console.log(username)
        if (typeof id == 'undefined' && typeof username == 'undefined') {
            res.status(400).send({
                success: false,
                message: 'Bad Request!One of the required field is missing!'
            })
        } else {
            await Post.findOneAndUpdate({ _id: id }, { $inc: { likes: 0.5 } }, (err, docs) => {
                docs.users.push(username)
                docs.save((err, docs) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: 'DB Error'
                        })
                    }
                })
                console.log(docs.users)
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: 'DB Error'
                    })
                } else {
                    res.status(200).send({
                        success: true,
                        message: 'Liked!'
                    })
                }
            })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function updatePosts(req, res) {
    try {
        const { _id, postcontent, posttitle } = req.body
        console.log(req.body.postimageid)
        await Post.findOneAndUpdate({ _id: _id }, { $set: { postcontent: postcontent, posttitle: posttitle } }, (err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Updated'
                })
            }
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function addComment(req, res) {
    try {
        const { id, username, commentcontent } = req.body
        if (typeof id == 'undefined' && typeof username == 'undefined' && typeof commentcontent == 'undefined') {
            res.status(400).send({
                success: false,
                message: 'Bad Request!'
            })
        } else {
            Post.findOne({ _id: id }, (err, docs) => {
                docs.comments.push({ username: username, commentcontent: commentcontent })
                docs.save((err, docs) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: 'DB Error'
                        })
                    } else {
                        res.status(200).send({
                            success: true,
                            message: 'Commented'
                        })
                    }
                })
            })
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function updateComment(req, res) {
    try {
        const { commentid, commentcontent } = req.body
        await Post.findOneAndUpdate({ 'comments._id': commentid }, { $set: { 'comments.$.commentcontent': commentcontent } }, (err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Comment Updated'
                })
            }
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function replyComment(req, res) {
    try {
        const { username, commentid, commentcontent } = req.body
        await Post.updateOne({ 'comments._id': commentid }, { $set: { 'comments': { $commentreply: { commentcontent: commentcontent, username: username } } } }, (err, docs) => {

            //await Post.updateOne({ 'comments._id': commentid }, { $set: { 'comments.$.commentreply.$.commentcontent': commentcontent, 'comments.$.commentreply.$.username': username } }, (err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Replied to comment!'
                })
            }
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function deleteComment(req, res) {
    try {
        const { id, commentid } = req.body
        await Post.updateOne({ '_id': id }, { $pull: { 'comments': { '_id': commentid } } }, (err, docs) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: 'DB Error'
                })
            } else {
                res.status(202).send({
                    success: true,
                    message: 'Comment Deleted!'
                })
            }
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}

async function viewLikes(req, res) {
    try {
        const { id } = req.params;
        if (typeof id == 'undefined') {
            res.status(400).send({
                success: false,
                message: 'Bad Request!Post Id is missing!'
            })
        } else {
            await Post.find({ _id: id }, (err, docs) => {
                let users = docs
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: 'DB Error'
                    })
                } else {
                    let array = docs[0].users
                    let result = []
                    array.sort();

                    var current = null;
                    var cnt = 0;
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] != current) {
                            if (cnt > 0) {
                                result[i] = cnt + " " + current;
                            }
                            current = array[i];
                            cnt = 1;
                        } else {
                            cnt++;
                        }
                    }
                    if (cnt > 0) {
                        result[i] = cnt + " " + current;
                    }
                    for (var i = 0; i < result.length; i++) {
                        if (result[i] == null) {
                            result.splice(i, 1);
                            i--;
                        }
                    }
                    res.status(200).send({
                        success: true,
                        message: result
                    })
                }
            })
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server Error!'
        })
    }
}
module.exports = {
    addPost,
    getPosts,
    deletePosts,
    likePost,
    updatePosts,
    addComment,
    updateComment,
    replyComment,
    deleteComment,
    viewLikes,
    postupload,
    postImageDownload,
    getPostsBasedOnUser


}
