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
const PunjabiThought = mongoose.models.PunjabThought || mongoose.model("PunjabiThought", punjabiThoughtSchema);
export default PunjabiThought;