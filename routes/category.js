const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware, superadminMiddleware } = require('../controllers/auth');
const { create,read,list,Delete } = require('../controllers/category');
const { runValidation } = require('../validators');
const { CategoryCreateValidator } = require('../validators/category');


router.post('/category/create', CategoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.post('/category/create', CategoryCreateValidator, runValidation, requireSignin, superadminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read);
// router.put('/category/:slug', requireSignin, adminMiddleware, update);
router.delete('/category/:slug', requireSignin, adminMiddleware, Delete);
router.delete('/category/:slug', requireSignin, superadminMiddleware, Delete);

module.exports = router;