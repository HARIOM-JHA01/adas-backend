import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
