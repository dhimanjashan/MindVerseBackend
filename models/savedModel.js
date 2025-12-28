import mongoose from "mongoose";


const savedSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  thoughts: [
    {
      text: {
        type: String,
        required: true,
      },
      writer: {
        type: String,
        required: true,
      },
    },
  ],
});
const Saved = mongoose.models.Saved || mongoose.model("Saved", savedSchema);
export default Saved;
