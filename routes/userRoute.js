const router = require('express').Router()
// const express = require('express')
// var multer = require('multer')
// const path = require('path')
// const crypto = require('crypto')

const userController = require('../controller/userController.js')


// var profileStorage = multer.diskStorage({
//     destination: "./profiles",
//     filename: function (req, file, cb) {
//         console.log("At Multer")
//         console.log(file)
//         console.log(path.extname(file.originalname))
//         cb(null, crypto.createHash('sha1').update(JSON.stringify(file)).digest('hex') + ".png");
//     }
// })

// var profileUpload = multer({
//     storage: profileStorage
// }).single('file')


//router.use(express.static(__dirname + "../profiles/"));

router.post('/login', userController.login);
router.post('/', userController.avatarupload, userController.addUser);




module.exports = router