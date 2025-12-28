import mongoose from "mongoose";

const thoughtSchema = new mongoose.Schema({
    thought:{
        type:String,
        required:true,
    },
    writer:{
        type:String,
        required:true,
    }
});
const Thought = mongoose.models.Thought || mongoose.model("Thought", thoughtSchema);
export default Thought;