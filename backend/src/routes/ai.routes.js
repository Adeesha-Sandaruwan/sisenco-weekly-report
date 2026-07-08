const express = require('express');
const router = express.Router();
const { generateResponse } = require('../controllers/ai.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.post('/chat', [verifyToken, isManager], generateResponse);

module.exports = router;