const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description },
      include: { users: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        users: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: { users: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
      orderBy: { firstName: 'asc' }
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body; 

    const project = await prisma.project.update({
      where: { id },
      data: {
        users: {
          set: userIds.map(uid => ({ id: uid }))
        }
      },
      include: {
        users: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });
    
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to assign. Ensure Prisma schema has a many-to-many relation between Project and User." });
  }
};

module.exports = { createProject, getAllProjects, updateProject, deleteProject, getTeamMembers, assignMembers };