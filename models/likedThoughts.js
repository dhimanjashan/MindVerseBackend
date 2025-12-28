import mongoose from "mongoose";


const likedSchema = new mongoose.Schema({
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
const Liked = mongoose.models.Liked || mongoose.model("Liked", likedSchema);
export default Liked;
