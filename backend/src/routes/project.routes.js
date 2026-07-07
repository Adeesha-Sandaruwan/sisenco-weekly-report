const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, updateProject, deleteProject } = require('../controllers/project.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, isManager], createProject);
router.get('/', verifyToken, getAllProjects);
router.put('/:id', [verifyToken, isManager], updateProject);
router.delete('/:id', [verifyToken, isManager], deleteProject);

module.exports = router;