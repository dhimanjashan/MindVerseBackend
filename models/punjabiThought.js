import mongoose from "mongoose";

const punjabiThoughtSchema = new mongoose.Schema({
    thought:{
        type:String,
        required:true,
    },
    writer:{
        type:String,
        required:true,
    }
});
const PunjabThought = mongoose.models.PunjabThought || mongoose.model("PunjabThought", punjabiThoughtSchema);
export default PunjabThought;