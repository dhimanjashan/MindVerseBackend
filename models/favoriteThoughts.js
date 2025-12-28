import mongoose from "mongoose";


const FavoriteSchema = new mongoose.Schema({
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
const MyFavorites = mongoose.models.MyFavorites || mongoose.model("MyFavorites", FavoriteSchema);
export default MyFavorites;
