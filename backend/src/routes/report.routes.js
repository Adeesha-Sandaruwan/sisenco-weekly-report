const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReportStatus, updateReport, deleteReport } = require('../controllers/report.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

router.post('/', verifyToken, createReport);
router.get('/me', verifyToken, getMyReports);
router.get('/all', [verifyToken, isManager], getAllReports);
router.patch('/:id/status', [verifyToken, isManager], updateReportStatus);
router.put('/:id', verifyToken, updateReport);
router.delete('/:id', verifyToken, deleteReport);

module.exports = router;