const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/project.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getProjects);
router.post('/', [verifyToken, isManager], createProject);

module.exports = router;