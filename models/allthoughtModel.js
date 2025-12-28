import mongoose from "mongoose";

const allThoughtSchema = new mongoose.Schema({
    thought:{
        type:String,
        required:true,
    },
    writer:{
        type:String,
        required:true,
    }
});
const AllThought = mongoose.models.AllThought || mongoose.model("AllThought", allThoughtSchema);
export default AllThought;