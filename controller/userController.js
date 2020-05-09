const User = require('../models/userModel')
const crypto = require('crypto')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    Bucket: aws.bucket + '/' + aws.avatarimages,
};


const awsDownloadParams = {
    Bucket: aws.bucket + '/' + aws.avatarimages,
};

var storage = multer.memoryStorage()
var avatarupload = multer({ storage: storage }).single('file');

function avatarImageDownload(req, res) {
    awsDownloadParams.Key = req.params.file;
    s3Client.getObject(awsDownloadParams)
        .createReadStream()
        .on('error', function (err) {
            console.log("Error  " + err);
        }).pipe(res);
}
function uploadAvatarPictureToAws(req, res) {
    const hash = {
        file: req.file
    }
    awsUploadParams.Key = crypto.createHash('sha1').update(JSON.stringify(hash)).digest('hex') + ".png";
    awsUploadParams.Body = req.file.buffer;
    try {
        s3Client.upload(awsUploadParams, (err, data) => {
            if (!err) {
                console.log('Avatar Image uploaded successfully !!' + req.file.originalname)
            }
        });
    } catch (error) {
        console.log('Error in Uploading the file ' + error)
    }

}

async function addUser(req, res) {
    try {
        const { name, password, email } = req.body
        console.log(name, password, email)
        if (typeof name == 'undefined' && typeof password == 'undefined' && typeof email == 'undefined') {

            throw new Error('Incomplete details to add new User')
        }
        else {
            await User.find({ name: req.body.name }, async (err, docs) => {
                if (docs.length != 0) {
                    res.status(403).send({
                        success: false,
                        message: 'User Name taken!Try another!'

                    })
                } else {
                    let newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    })
                    if (req.file != undefined) {
                        uploadAvatarPictureToAws(req, res)
                        const hash = {
                            file: req.file
                            // fieldname: req.file.fieldname,
                            // originalname: req.file.originalname,
                            // encoding: req.file.encoding,
                            // mimetype: req.file.mimetype
                        }
                        newUser['profileimageid'] = crypto.createHash('sha1').update(JSON.stringify(hash)).digest('hex');
                        newUser.save((err, docs) => {
                            if (err) {
                                res.status(500).send({
                                    success: false,
                                    message: 'DB Error'
                                })
                            } else {
                                res.status(200).send({
                                    success: true,
                                    message: 'User Created!'
                                })
                            }
                        })
                    }
                    else {
                        res.status(400).send({
                            success: false,
                            message: 'Bad Request!Profile Image missing!'
                        })
                    }

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

async function login(req, res) {
    try {
        const { name, password } = req.body
        if (typeof name == 'undefined' && typeof password == 'undefined') {
            res.status(400).send({
                success: false,
                message: 'Bad Request!One or more fields are missing!'
            })
        } else {
            await User.findOne({ name: name }, (err, docs) => {
                if (!docs) {
                    res.status(204).send({
                        success: true,
                        message: 'No matches'
                    })
                } else {
                    bcrypt.compare(password, docs.password, (err, result) => {
                        if (!result) {
                            jwt.sign({ docs }, 'secret', (err, token) => {
                                res.status(200).send({
                                    success: true,
                                    name: docs.name,
                                    message: 'Logged in as ' + docs.name + '.',
                                    jwttoken: token
                                });
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: 'Wrong Password!'
                            });
                        }
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
    addUser,
    login,
    avatarupload,
    avatarImageDownload
}