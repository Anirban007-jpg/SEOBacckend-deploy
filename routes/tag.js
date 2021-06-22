const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware, superadminMiddleware } = require('../controllers/auth');
const { create, list, read, Delete } = require('../controllers/tag');
const { runValidation } = require('../validators');
const {TagCreateValidator} = require('../validators/tag');


router.post('/tag/create', TagCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.post('/tag/create', TagCreateValidator, runValidation, requireSignin, superadminMiddleware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
// // router.put('/category/:slug', requireSignin, adminMiddleware, update);
router.delete('/tag/:slug', requireSignin, adminMiddleware, Delete);
router.delete('/tag/:slug', requireSignin, superadminMiddleware, Delete);

module.exports = router;