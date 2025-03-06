import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import ollama from "ollama";
import Question from "./models/Question.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev")); // Logging middleware

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to the database");

// Global session variables
let askedQuestions = new Set();
let questionCount = 0;
const totalQuestions = 3; // Total rounds of Q&A

// Helper function to fetch a truly random question (excluding those already asked)
const getNextQuestion = async () => {
  const askedArray = Array.from(askedQuestions);
  const result = await Question.aggregate([
    { $match: { question: { $nin: askedArray } } },
    { $sample: { size: 1 } }
  ]);
  
  if (!result.length) {
    return null;
  }
  
  const randomQuestion = result[0];
  askedQuestions.add(randomQuestion.question);
  return randomQuestion;
};

/**
 * POST /api/start
 * Accepts the user's name, resets the session,
 * and responds with a personalized welcome message along with the first question.
 */
app.post("/api/start", async (req, res) => {
  const { name } = req.body;
  console.log("/api/start", name);
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  // Reset session state on start
  askedQuestions.clear();
  questionCount = 0;

  const greetingMessage = `Hello ${name}! Welcome to the ADAS Chat-Based Quiz. In this session, you'll tackle ${totalQuestions} questions designed to test your understanding of ADAS systems. Each question offers a unique opportunity to receive targeted feedback and improve your grasp on the topic. Let's get started!`;

  // Retrieve the first question
  const firstQuestionData = await getNextQuestion();
  if (!firstQuestionData) {
    return res.status(404).json({ error: "No questions found." });
  }

  questionCount++; // First question issued
  res.json({ message: greetingMessage, question: firstQuestionData.question });
});

/**
 * POST /api/ask
 * Accepts the user's answer for the current question,
 * evaluates it using the ollama model, and returns feedback.
 * If there are rounds remaining, it also sends the next question;
 * otherwise, it indicates the end of the quiz rounds.
 */
app.post("/api/ask", async (req, res) => {
  console.log("/api/ask", req.body);
  const { question, userAnswer } = req.body;
  const questionData = await Question.findOne({ question });

  if (!questionData) {
    return res.status(400).json({ error: "Question not found." });
  }

  const startTime = Date.now();

  const prompt = `
You are an expert tutor providing concise, human-like feedback on a student's answer. Please respond in the first person as if you are directly speaking to the student. Begin your response by clearly evaluating the student's answer in terms of correctness, clarity, and completeness, using phrases like "I think" or "based on your answer." Then, in one or two additional sentences, explain what key elements or details are missing and offer brief suggestions for improvement. Avoid asking questions or adding any unnecessary commentary.
**Important:** Base your feedback strictly on the ADAS reference answer provided below. Do not include any extra information outside of the existing ADAS content.
---
**Reference Answer (for your context only):** "${questionData.answer}"
**User's Answer:** "${userAnswer}"
`;

  const response = await ollama.generate({
    model: process.env.OLLAMA_MODEL,
    prompt,
  });

  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // If there are more rounds left, fetch the next question
  if (questionCount < totalQuestions) {
    const nextQuestionData = await getNextQuestion();
    questionCount++;
    if (!nextQuestionData) {
      return res.json({
        feedback: response.response,
        responseTime: `${responseTime}ms`,
        nextQuestion: "No more questions available."
      });
    }
    return res.json({
      feedback: response.response,
      responseTime: `${responseTime}ms`,
      nextQuestion: nextQuestionData.question
    });
  } else {
    // End of quiz rounds; prompt for follow-up questions
    return res.json({
      feedback: response.response,
      responseTime: `${responseTime}ms`,
      nextStep: "The quiz rounds are complete. Do you have any additional questions or anything you'd like to know?"
    });
  }
});

/**
 * GET /api/followup
 * Returns a prompt asking if the user has any other questions or topics to discuss.
 */
app.get("/api/followup", (req, res) => {
  console.log("/api/followup");
  res.json({ prompt: "Do you have any other questions or topics you'd like to discuss?" });
});

/**
 * POST /api/followup
 * Accepts a follow-up query from the user and generates a response using the ollama model.
 * The prompt instructs the AI to check whether the question is related to ADAS.
 * - If the query is ADAS related, provide a clear and helpful ADAS answer.
 * - If not, simply respond with a goodbye message.
 */
app.post("/api/followup", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  const prompt = `
  You are a highly knowledgeable and experienced tutor with deep expertise in Advanced Driver Assistance Systems (ADAS). Your role is to provide expert-level, detailed guidance and insights exclusively within the ADAS domain. A user has posed the following follow-up question:
  "${query}"
  Please provide a clear, detailed, and helpful response that includes technical insights, real-world examples, and practical advice strictly related to ADAS. Ensure that your explanation is comprehensive and remains within the boundaries of ADAS technology and concepts.
  If the question is not related to ADAS, or if it deviates from the ADAS subject matter, please respond with: "Your question does not appear to be related to ADAS. Please ask an ADAS-related question."
  Additionally, if the user indicates a desire to discontinue the conversation or states they do not wish to continue, your response should politely conclude the interaction with: "Thank you and goodbye." In this case, make sure to end the conversation in a respectful and professional manner.
  `;
  

  const response = await ollama.generate({
    model: process.env.OLLAMA_MODEL,
    prompt,
  });

  res.json({ answer: response.response });
});

/**
 * GET /api/reset
 * Resets the quiz session so the user can start again.
 */
app.get("/api/reset", (req, res) => {
  console.log("/api/reset");
  askedQuestions.clear();
  questionCount = 0;
  res.json({ message: "Session reset. You can start the quiz again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
