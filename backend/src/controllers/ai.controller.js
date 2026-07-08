const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenAI } = require('@google/genai');

const generateResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "System Error: GEMINI_API_KEY is missing in the backend environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const reports = await prisma.report.findMany({
      include: { user: true, project: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const contextData = reports.map(r => ({
      member: `${r.user.firstName} ${r.user.lastName}`,
      project: r.project.name,
      status: r.status,
      tasksCompleted: r.tasksCompleted,
      blockers: r.blockers,
      hours: r.hoursWorked,
      weekStart: r.weekStartDate
    }));

    const systemInstruction = `You are Sisenco AI, an elite analytical assistant for engineering managers. 
    Use the following recent team report data to answer the manager's query accurately. 
    Analyze the data to provide insights on completed work, blockers, and workload. 
    Be concise, highly professional, and use a futuristic, analytical tone. Do not use markdown headers, just bold text where needed.
    
    RAW TEAM DATA:
    ${JSON.stringify(contextData)}
    
    MANAGER QUERY:
    ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction,
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    res.status(500).json({ reply: "I encountered a neural link failure connecting to the AI core. Please check server logs." });
  }
};

module.exports = { generateResponse };