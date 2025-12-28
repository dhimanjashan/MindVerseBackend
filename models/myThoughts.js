import mongoose from "mongoose";

// Define schema for a single thought
const ThoughtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }), // Example: "Oct 24, 2025"
    },
    mood: {
      type: String,
      default: "🙂",
    },
  },
  { _id: false } // no separate _id for each thought
);

// Main schema for user’s thoughts
const MyThoughtsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user has one document containing all their thoughts
    },
    thoughts: {
      type: [ThoughtSchema], // Array of thoughts
      default: [],
    },
  },
  { timestamps: true }
);

const MyThoughts =
  mongoose.models.MyThoughts || mongoose.model("MyThoughts", MyThoughtsSchema);

export default MyThoughts;
