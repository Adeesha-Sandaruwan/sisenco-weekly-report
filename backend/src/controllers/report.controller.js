const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes, projectId } = req.body;
    const report = await prisma.report.create({
      data: {
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        tasksCompleted,
        tasksPlanned,
        blockers,
        hoursWorked: hoursWorked ? parseInt(hoursWorked) : null,
        notes,
        projectId,
        userId: req.userId
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
      orderBy: { weekStartDate: 'desc' }
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
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
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

module.exports = { createReport, getMyReports, getAllReports, updateReportStatus };