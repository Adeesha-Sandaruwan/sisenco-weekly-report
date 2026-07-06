const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReportStatus } = require('../controllers/report.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.post('/', verifyToken, createReport);
router.get('/me', verifyToken, getMyReports);
router.get('/all', [verifyToken, isManager], getAllReports);
router.patch('/:id/status', [verifyToken, isManager], updateReportStatus);

module.exports = router;