import mongoose from "mongoose";

const hindiThoughtSchema = new mongoose.Schema({
    thought:{
        type:String,
        required:true,
    },
    writer:{
        type:String,
        required:true,
    }
});
const HindiThought = mongoose.models.HindiThought || mongoose.model("HindiThought", hindiThoughtSchema);
export default HindiThought;