const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  try {
    const { projectId, weekStartDate, weekEndDate, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes } = req.body;
    const report = await prisma.report.create({
      data: {
        userId: req.userId,
        projectId,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        tasksCompleted,
        tasksPlanned,
        blockers,
        hoursWorked: hoursWorked ? parseInt(hoursWorked) : null,
        notes
      },
      include: {
        project: true
      }
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.userId },
      include: { project: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const report = await prisma.report.update({
      where: { id },
      data: { status }
    });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, weekStartDate, weekEndDate, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes } = req.body;
    
    const existingReport = await prisma.report.findUnique({ where: { id } });
    if (!existingReport || existingReport.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        projectId,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        tasksCompleted,
        tasksPlanned,
        blockers,
        hoursWorked: hoursWorked ? parseInt(hoursWorked) : null,
        notes
      },
      include: {
        project: true
      }
    });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingReport = await prisma.report.findUnique({ where: { id } });
    if (!existingReport || existingReport.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await prisma.report.delete({ where: { id } });
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getMyReports, getAllReports, updateReportStatus, updateReport, deleteReport };