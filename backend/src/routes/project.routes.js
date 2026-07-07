const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, updateProject, deleteProject, getTeamMembers, assignMembers } = require('../controllers/project.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.post('/', [verifyToken, isManager], createProject);
router.get('/', verifyToken, getAllProjects);
router.get('/members', [verifyToken, isManager], getTeamMembers); // Route to fetch users
router.put('/:id', [verifyToken, isManager], updateProject);
router.delete('/:id', [verifyToken, isManager], deleteProject);
router.patch('/:id/assign', [verifyToken, isManager], assignMembers); // Route to assign

module.exports = router;