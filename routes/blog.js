const express = require('express');
const router = express.Router();
const { runValidation } = require('../validators');
const {requireSignin, adminMiddleware, authMiddleware, customerMiddleware} = require('../controllers/auth');
const { create, listBlogs, listBlogswithcatandtag, readBlog,updateblog,removeblog, Blogphoto, listRelatedBlogs,createBlog, listSearch } = require('../controllers/blog');

router.post('/blog/create', requireSignin, adminMiddleware, create);
router.post('/blog/user/create', requireSignin, authMiddleware, createBlog);
router.post('/blog/customer/create', requireSignin, customerMiddleware, createBlog);
router.get('/blogs', listBlogs);
router.post('/blogs-categories-tags', listBlogswithcatandtag);
router.get('/blog/:slug', readBlog);
router.put('/blog/:slug', requireSignin, adminMiddleware, updateblog);
router.put('/blog/user/:slug', requireSignin, authMiddleware);
router.delete('/blog/:slug', requireSignin, adminMiddleware, removeblog);
router.get('/blog/search', listSearch);




// get related blogs route
router.post('/blogs/related', listRelatedBlogs);


// get blog photo
router.get('/blog/photo/:slug',Blogphoto)

module.exports = router;