const router = require('express').Router()
// const express = require('express')
// var multer = require('multer')
// const path = require('path')
// const crypto = require('crypto')

const postController = require('../controller/postController.js')
const middleware = require('../middleware/tokenValidation')

// var Storage = multer.diskStorage({
//     destination: "./uploads",
//     filename: function (req, file, cb) {
//         // console.log("At Multer")
//         // console.log(file)
//         // console.log(path.extname(file.originalname))
//         cb(null, crypto.createHash('sha1').update(JSON.stringify(file)).digest('hex') + "." + path.extname(file.originalname));
//     }
// })

// var postupload = multer({
//     storage: Storage
// }).single('file')

// router.use(express.static(__dirname + "./uploads/"));

router.post('/comment', middleware.isTokenPresent, postController.addComment);
// router.delete('/comment', postController.deleteComment);
router.put('/comment', middleware.isTokenPresent, postController.updateComment);
router.post('/replycomment', middleware.isTokenPresent, postController.replyComment);

router.get('/viewlikes/:id', middleware.isTokenPresent, postController.viewLikes);
router.post('/', middleware.isTokenPresent, postController.postupload, postController.addPost);
router.get('/download/:file', postController.postImageDownload)
router.get('/:name', middleware.isTokenPresent, postController.getPostsBasedOnUser);
router.get('/', middleware.isTokenPresent, postController.getPosts);
router.delete('/:id', middleware.isTokenPresent, postController.deletePosts);
router.put('/like', middleware.isTokenPresent, postController.likePost);
router.put('/', middleware.isTokenPresent, postController.updatePosts);







module.exports = router