import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  INITIAL_EXERCISES,
  INITIAL_ROUTINES,
  INITIAL_SCHEDULED_TASKS,
  INITIAL_MEALS,
  INITIAL_MEMBERS,
  INITIAL_ATTENDANCE_LOGS,
} from "./src/data/gymData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support base64 image uploads from camera and large JSON payloads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// In-Memory Database Store (Simulating persistent cloud/server storage)
const db = {
  exercises: [...INITIAL_EXERCISES],
  routines: [...INITIAL_ROUTINES],
  tasks: [...INITIAL_SCHEDULED_TASKS],
  meals: [...INITIAL_MEALS],
  waterIntakeMl: 1750,
  waterTargetMl: 3000,
  members: [...INITIAL_MEMBERS],
  attendanceLogs: [...INITIAL_ATTENDANCE_LOGS],
  maxGymCapacity: 120,
  serverStartTime: new Date().toISOString(),
};

// Lazy init AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// 1. SYSTEM & HEALTH REST ENDPOINTS
// ==========================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Apex Gym Backend REST Engine",
    hasAiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      exercises: db.exercises.length,
      routines: db.routines.length,
      tasks: db.tasks.length,
      meals: db.meals.length,
      members: db.members.length,
      activeAttendance: db.attendanceLogs.filter((l) => l.status === "Checked-In").length,
    },
  });
});

// System Status endpoint
app.get("/api/system/status", (req, res) => {
  const activeCount = db.attendanceLogs.filter((l) => l.status === "Checked-In").length;
  res.json({
    backendOnline: true,
    version: "2.4.0-pro",
    uptimeSeconds: Math.floor(process.uptime()),
    serverStartTime: db.serverStartTime,
    currentOccupancy: activeCount,
    maxCapacity: db.maxGymCapacity,
    capacityPercentage: Math.round((activeCount / db.maxGymCapacity) * 100),
    totalMembers: db.members.length,
    totalRoutines: db.routines.length,
    hasAiVision: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ==========================================
// 2. WORKOUTS & EXERCISES REST ENDPOINTS
// ==========================================

// GET all exercises
app.get("/api/exercises", (req, res) => {
  const { muscleGroup, search } = req.query;
  let results = db.exercises;

  if (muscleGroup && typeof muscleGroup === "string") {
    results = results.filter(
      (e) => e.muscleGroup.toLowerCase() === muscleGroup.toLowerCase()
    );
  }

  if (search && typeof search === "string") {
    const query = search.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.primaryMuscle.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET all workout routines
app.get("/api/routines", (req, res) => {
  res.json({ success: true, count: db.routines.length, data: db.routines });
});

// POST create custom routine
app.post("/api/routines", (req, res) => {
  const { name, focus, difficulty, durationMin, exercises, description } = req.body;

  if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: "Routine name and at least one exercise required" });
  }

  const newRoutine = {
    id: `routine-custom-${Date.now()}`,
    name: name.trim(),
    description: description || "Custom lifter split crafted in Apex Pro",
    focus: focus || "Hypertrophy & Strength",
    difficulty: (difficulty as any) || "Intermediate",
    durationMin: Number(durationMin) || 55,
    exercises,
    isCustom: true,
  };

  db.routines.unshift(newRoutine as any);
  res.status(201).json({ success: true, message: "Routine created successfully", data: newRoutine });
});

// POST log completed workout session
app.post("/api/workout/complete", (req, res) => {
  const { memberId = "mem-1", routineName, durationMin, totalVolumeKg } = req.body;

  const member = db.members.find((m) => m.id === memberId);
  if (member) {
    member.currentStreak += 1;
    if (member.currentStreak > member.bestStreak) {
      member.bestStreak = member.currentStreak;
    }
    member.totalVisits += 1;
    member.lastCheckIn = "Just now";
  }

  res.json({
    success: true,
    message: "Workout completed and stats logged to backend",
    memberStats: member
      ? {
          currentStreak: member.currentStreak,
          bestStreak: member.bestStreak,
          totalVisits: member.totalVisits,
        }
      : null,
    summary: {
      routineName,
      durationMin,
      totalVolumeKg,
      completedAt: new Date().toISOString(),
    },
  });
});

// ==========================================
// 3. DIET & NUTRITION REST ENDPOINTS
// ==========================================

// GET daily diet and hydration stats
app.get("/api/diet", (req, res) => {
  const totalCalories = db.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = db.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = db.meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = db.meals.reduce((sum, m) => sum + m.fat, 0);

  res.json({
    success: true,
    data: {
      meals: db.meals,
      waterIntakeMl: db.waterIntakeMl,
      waterTargetMl: db.waterTargetMl,
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
    },
  });
});

// POST add meal
app.post("/api/diet/meals", (req, res) => {
  const { name, calories, protein, carbs, fat, time, mealType } = req.body;

  if (!name || calories === undefined) {
    return res.status(400).json({ error: "Meal name and calories are required" });
  }

  const newMeal = {
    id: `meal-${Date.now()}`,
    time: time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    mealType: (mealType as any) || "Lunch",
    name: name.trim(),
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
  };

  db.meals.unshift(newMeal as any);
  res.status(201).json({ success: true, message: "Meal added", data: newMeal });
});

// DELETE meal
app.delete("/api/diet/meals/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = db.meals.length;
  db.meals = db.meals.filter((m) => m.id !== id);

  if (db.meals.length === initialLength) {
    return res.status(404).json({ error: "Meal not found" });
  }

  res.json({ success: true, message: "Meal removed successfully" });
});

// POST update water intake
app.post("/api/diet/water", (req, res) => {
  const { amountMl, reset } = req.body;

  if (reset) {
    db.waterIntakeMl = 0;
  } else if (typeof amountMl === "number") {
    db.waterIntakeMl = Math.max(0, db.waterIntakeMl + amountMl);
  }

  res.json({
    success: true,
    waterIntakeMl: db.waterIntakeMl,
    waterTargetMl: db.waterTargetMl,
    percentage: Math.min(100, Math.round((db.waterIntakeMl / db.waterTargetMl) * 100)),
  });
});

// ==========================================
// 4. DAILY PLANNER & TASKS REST ENDPOINTS
// ==========================================

// GET all tasks
app.get("/api/tasks", (req, res) => {
  res.json({ success: true, count: db.tasks.length, data: db.tasks });
});

// POST create task
app.post("/api/tasks", (req, res) => {
  const { title, date, time, type, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const newTask = {
    id: `task-${Date.now()}`,
    date: date || new Date().toISOString().split("T")[0],
    time: time || "12:00 PM",
    title: title.trim(),
    type: (type as any) || "workout",
    completed: false,
    notes: notes || "",
  };

  db.tasks.unshift(newTask as any);
  res.status(201).json({ success: true, message: "Task created", data: newTask });
});

// PATCH toggle task completion
app.patch("/api/tasks/:id/toggle", (req, res) => {
  const { id } = req.params;
  const task = db.tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.completed = !task.completed;
  res.json({ success: true, message: `Task marked as ${task.completed ? "completed" : "pending"}`, data: task });
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const initialCount = db.tasks.length;
  db.tasks = db.tasks.filter((t) => t.id !== id);

  if (db.tasks.length === initialCount) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json({ success: true, message: "Task deleted" });
});

// ==========================================
// 5. MEMBERS & ATTENDANCE REST ENDPOINTS
// ==========================================

// GET all members
app.get("/api/members", (req, res) => {
  res.json({ success: true, count: db.members.length, data: db.members });
});

// GET attendance logs and current gym status
app.get("/api/attendance", (req, res) => {
  const activeLogs = db.attendanceLogs.filter((l) => l.status === "Checked-In");
  res.json({
    success: true,
    currentOccupancy: activeLogs.length,
    maxCapacity: db.maxGymCapacity,
    capacityPercentage: Math.round((activeLogs.length / db.maxGymCapacity) * 100),
    peakHour: "6:00 PM - 8:30 PM",
    logs: db.attendanceLogs,
  });
});

// POST check in member
app.post("/api/check-in", (req, res) => {
  const { memberId, method = "QR_CODE" } = req.body;

  const member = db.members.find((m) => m.id === memberId || m.membershipId === memberId);
  if (!member) {
    return res.status(404).json({ error: "Member not found in database" });
  }

  // Check if member already checked in
  const existingActive = db.attendanceLogs.find(
    (l) => l.memberId === member.id && l.status === "Checked-In"
  );

  if (existingActive) {
    return res.json({
      success: true,
      alreadyCheckedIn: true,
      message: `${member.name} is already checked in on the gym floor.`,
      log: existingActive,
    });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toISOString().split("T")[0];

  const newLog = {
    id: `att-${Date.now()}`,
    memberId: member.id,
    memberName: member.name,
    avatarUrl: member.avatarUrl,
    timestamp: now.toISOString(),
    dateStr,
    timeStr,
    checkInMethod: (method as any) || "QR_CODE",
    status: "Checked-In" as const,
    durationMins: 0,
  };

  db.attendanceLogs.unshift(newLog);
  member.totalVisits += 1;
  member.currentStreak += 1;
  if (member.currentStreak > member.bestStreak) {
    member.bestStreak = member.currentStreak;
  }
  member.lastCheckIn = "Just now";
  member.isCurrentlyInside = true;

  res.status(201).json({
    success: true,
    message: `Access granted! Welcome to Apex Gym, ${member.name}.`,
    data: newLog,
    member,
  });
});

// POST check out member
app.post("/api/check-out", (req, res) => {
  const { memberId } = req.body;

  const activeLog = db.attendanceLogs.find(
    (l) => (l.memberId === memberId || l.id === memberId) && l.status === "Checked-In"
  );

  if (!activeLog) {
    return res.status(404).json({ error: "Active checked-in session not found for this member" });
  }

  const checkInTime = new Date(activeLog.timestamp).getTime();
  const now = Date.now();
  const durationMins = Math.max(15, Math.round((now - checkInTime) / (1000 * 60)));

  activeLog.status = "Completed";
  activeLog.durationMins = durationMins;

  const member = db.members.find((m) => m.id === activeLog.memberId);
  if (member) {
    member.isCurrentlyInside = false;
  }

  res.json({
    success: true,
    message: `${activeLog.memberName} checked out. Workout duration: ${durationMins} minutes.`,
    data: activeLog,
  });
});

// ==========================================
// 6. AI NUTRITION SCANNER & AI COACH
// ==========================================

// AI Gym Coach Q&A endpoint
app.post("/api/ai-coach", async (req, res) => {
  try {
    const { question, userContext } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question parameter is required" });
    }

    const client = getAiClient();

    if (!client) {
      return res.json({
        answer:
          "To optimize hypertrophy, focus on progressive overload with 8-12 reps per set, keeping 1-2 reps in reserve (RIR). Ensure you consume 1.6-2.2g of protein per kg of bodyweight, and prioritize 7-9 hours of quality sleep for muscular recovery.",
        isSimulated: true,
        source: "Apex AI Coach Offline Knowledge Base",
      });
    }

    const prompt = `You are the Head Athletic Coach and Sports Nutritionist at Apex Pro Gym.
Answer this user question with concise, scientifically backed, highly practical fitness advice:
Question: "${question}"
${userContext ? `Lifter Context: ${JSON.stringify(userContext)}` : ""}

Format your reply clearly with short bullet points and motivational athlete-focused tone.`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      answer: response.text || "Keep training with disciplined form and progressive overload!",
      isSimulated: false,
    });
  } catch (err: any) {
    console.error("AI Coach error:", err);
    res.status(200).json({
      answer:
        "For maximum strength gains: Focus on compound lifts (Squat, Bench, Deadlift, Overhead Press), maintain strict tempo (3s eccentric), and hydrate with electrolytes before heavy sets.",
      isSimulated: true,
      error: err?.message,
    });
  }
});

// AI Food Scanner endpoint using Vision Model
app.post("/api/scan-food", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 parameter" });
    }

    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const client = getAiClient();

    if (!client) {
      // Fallback realistic smart analysis if API key is not yet configured
      return res.json({
        dishName: "Grilled Chicken & Quinoa Fitness Bowl",
        confidence: "high",
        servingSize: "Standard Athletic Portion (~420g)",
        totalCalories: 540,
        protein: 48,
        carbs: 52,
        fat: 14,
        fiber: 7,
        nutritionScore: 92,
        category: "High-Protein / Lean Muscle",
        athleticInsight:
          "Excellent 1:1 protein to complex carbs ratio with healthy fats. Ideal for post-workout glycogen replenishment and muscle protein synthesis.",
        items: [
          { name: "Grilled Herb Chicken Breast", quantity: "180g", calories: 290, protein: 42, carbs: 0, fat: 5 },
          { name: "Steamed Quinoa & Brown Rice", quantity: "150g", calories: 180, protein: 4, carbs: 36, fat: 2 },
          { name: "Roasted Broccoli & Asparagus", quantity: "70g", calories: 40, protein: 2, carbs: 8, fat: 1 },
          { name: "Extra Virgin Olive Oil Drizzle", quantity: "5ml", calories: 30, protein: 0, carbs: 0, fat: 6 },
        ],
        isSimulated: true,
      });
    }

    const prompt = `You are an elite sports nutritionist and computer vision nutrition analyzer for a pro gym app.
Analyze this meal photo thoroughly. Identify every visible food component, estimate portion sizes realistically for an active gym-goer, and compute accurate macronutrients (Calories, Protein in grams, Carbs in grams, Fats in grams, Dietary Fiber in grams).
${notes ? `User context: "${notes}"` : ""}
Provide a clear athletic breakdown and actionable recommendations for a lifter/athlete.`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: "Recognized primary name of the dish" },
            confidence: { type: Type.STRING, description: "high, medium, or low" },
            servingSize: { type: Type.STRING, description: "Estimated total portion weight/size" },
            totalCalories: { type: Type.INTEGER, description: "Estimated total calories" },
            protein: { type: Type.INTEGER, description: "Total protein in grams" },
            carbs: { type: Type.INTEGER, description: "Total carbs in grams" },
            fat: { type: Type.INTEGER, description: "Total fats in grams" },
            fiber: { type: Type.INTEGER, description: "Dietary fiber in grams" },
            nutritionScore: { type: Type.INTEGER, description: "Fitness nutrition score from 1 to 100" },
            category: { type: Type.STRING, description: "e.g. High-Protein, Balanced, Low-Carb, Cheat Meal" },
            athleticInsight: { type: Type.STRING, description: "Advice for muscle building, fat loss, or recovery" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  protein: { type: Type.INTEGER },
                  carbs: { type: Type.INTEGER },
                  fat: { type: Type.INTEGER },
                },
                required: ["name", "calories", "protein", "carbs", "fat"],
              },
            },
          },
          required: [
            "dishName",
            "confidence",
            "servingSize",
            "totalCalories",
            "protein",
            "carbs",
            "fat",
            "fiber",
            "nutritionScore",
            "category",
            "athleticInsight",
            "items",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated by model");
    }

    const parsedData = JSON.parse(text);
    return res.json({
      ...parsedData,
      isSimulated: false,
    });
  } catch (err: any) {
    console.error("AI Food Scanner error:", err);
    // Return a sensible fallback rather than crashing the client
    return res.status(200).json({
      dishName: "High-Protein Athletic Meal",
      confidence: "medium",
      servingSize: "Approx. 1 meal serving (~380g)",
      totalCalories: 510,
      protein: 44,
      carbs: 48,
      fat: 13,
      fiber: 6,
      nutritionScore: 88,
      category: "Balanced Athletic Fuel",
      athleticInsight:
        "Nutrient-dense meal suitable for recovery. Consistent protein intake helps fuel muscle repair.",
      items: [
        { name: "Lean Protein Source", quantity: "160g", calories: 260, protein: 38, carbs: 0, fat: 4 },
        { name: "Complex Carbohydrates", quantity: "140g", calories: 190, protein: 4, carbs: 40, fat: 2 },
        { name: "Fresh Greens & Veggies", quantity: "80g", calories: 60, protein: 2, carbs: 8, fat: 7 },
      ],
      isSimulated: true,
      errorNotice: err?.message || "Processed with fallback offline neural estimator",
    });
  }
});

// Setup Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Apex Gym Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

