import mongoose from "mongoose";

const ReadThoughtSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  readThought: {
    type: Number,
    default: 0,
  },
});

const ReadThought = mongoose.models.ReadThought || mongoose.model("ReadThought", ReadThoughtSchema);
export default ReadThought;
