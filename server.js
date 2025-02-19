import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import ollama from "ollama";
import Question from "./models/Question.js";  

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to the database");

let askedQuestions = new Set(); // Store already asked questions

// Fetch a random question (excluding already asked ones)
const getNextQuestion = async () => {
  const questions = await Question.find();
  const remainingQuestions = questions.filter(q => !askedQuestions.has(q.question));

  if (remainingQuestions.length === 0) {
    return null; // No more questions left
  }

  const randomQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
  askedQuestions.add(randomQuestion.question); // Mark this question as asked

  return randomQuestion;
};

app.get("/api/question", async (req, res) => {
  const questions = await Question.find();
  if (questions.length === 0) return res.status(404).json({ error: "No questions found." });

  const remainingQuestions = questions.filter(q => !askedQuestions.has(q.question));

  if (remainingQuestions.length === 0) {
      return res.json({ message: "All questions have been asked!" });
  }

  const randomQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
  askedQuestions.add(randomQuestion.question);

  const introMessage = "👋 Welcome to the ADAS Chat-Based Quiz! Let's get started. 🚀\n\n";

  res.json({
      // question: askedQuestions.size === 1 ? introMessage + randomQuestion.question : randomQuestion.question
      question: false ? introMessage + randomQuestion.question : randomQuestion.question
  });
});

  

// Reset asked questions when the quiz is complete
app.get("/api/reset", (req, res) => {
  askedQuestions.clear();
  res.json({ message: "Quiz reset. You can start again." });
});

// Process user answer & provide feedback + next question
app.post("/api/ask", async (req, res) => {
  const { question, userAnswer } = req.body;
  const questionData = await Question.findOne({ question });

  if (!questionData) {
    return res.status(400).json({ error: "Question not found." });
  }

  // Start measuring response time
  const startTime = Date.now();

  const prompt = `
  You are an expert evaluator providing feedback to a student. 
  Evaluate the user's answer based on correctness, clarity, and completeness.
  The correct answer is provided for your reference, but do not just compare it word-for-word. 
  Instead, assess whether the user's response captures the key idea and provide constructive feedback. 
  Be concise and speak in first person, as if you are a human tutor.
  
  ---
  **Correct Answer (Reference Only):** "${questionData.answer}"
  **User's Answer:** "${userAnswer}"
  
  Provide a natural-sounding evaluation of the user's answer.
  If it's correct, confirm and encourage them.
  If it's incorrect or incomplete, provide a brief correction or suggestion without being too robotic.
  don't end with a summary question
  `;

  const response = await ollama.generate({
    model: process.env.OLLAMA_MODEL,
    prompt,
  });

  const endTime = Date.now();
  const responseTime = endTime - startTime; // Calculate response time in milliseconds

  // Get the next question
  const nextQuestion = await getNextQuestion();

  res.json({
    feedback: response.response, // AI feedback
    responseTime: `${responseTime}ms`, // Time taken to process feedback
    nextQuestion: nextQuestion ? nextQuestion.question : "All questions have been asked!"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
