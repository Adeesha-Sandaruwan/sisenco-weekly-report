const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenAI } = require('@google/genai');

const generateResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "System Error: GEMINI_API_KEY is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Fetch the last 100 reports for deep historical context
    const reports = await prisma.report.findMany({
      include: { 
        user: { select: { firstName: true, lastName: true, role: true } }, 
        project: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const contextData = reports.map(r => ({
      member: `${r.user.firstName} ${r.user.lastName}`,
      project: r.project.name,
      status: r.status,
      tasksPlanned: r.tasksPlanned,
      tasksCompleted: r.tasksCompleted,
      blockers: r.blockers || "None",
      hoursLogged: r.hoursWorked || 0,
      weekStart: r.weekStartDate.toISOString().split('T')[0],
      weekEnd: r.weekEndDate.toISOString().split('T')[0]
    }));

    const currentDate = new Date().toDateString();

    const systemInstruction = `You are Sisenco Core, an elite, highly analytical AI assistant for an Engineering Manager. 
    You have direct neural access to the team's weekly reports.
    
    CRITICAL SYSTEM CONTEXT:
    - Today's Date is: ${currentDate}. Use this to determine what "last week" or "this week" means.
    
    TEAM DATA PAYLOAD (Latest 100 Reports):
    ${JSON.stringify(contextData)}
    
    YOUR DIRECTIVES:
    1. If asked about blockers, cross-reference all projects and highlight critical risks.
    2. If asked about velocity, aggregate hours and completed tasks.
    3. If asked about compliance, identify who has PENDING or LATE status.
    4. Keep answers concise, highly professional, data-driven, and futuristic. 
    5. Do not use markdown headers (like # or ##). Use bolding (**text**) for emphasis.
    
    MANAGER QUERY:
    ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction,
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ reply: "Neural link failure. I cannot reach the AI core at this moment." });
  }
};

module.exports = { generateResponse };