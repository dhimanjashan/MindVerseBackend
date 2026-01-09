// routes/userRoutes.js
import express from "express";
import { registerUser, loginUser, deleteUser, updatepassword, updateuser, getUser, getThoughts,saveThought,getSavedThoughts,saveMyThoughts,getMyThoughts,deleteThought,saveMyFavorites,getMyFavorites,deleteFavorite,getAllThoughts,saveLikedThought,getLikedThoughts,deleteSaved,getPunjabiThoughts,getHindiThoughts,saveReadThought,getReadThought,getAiThought } from "../controller/userController.js";
// import { upload } from "../middleware/upload.js";
import upload from "../config/multer.js";

const router = express.Router();
router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", loginUser);
router.post("/delete", deleteUser);
router.put("/updatepassword", updatepassword);
router.put("/updateuser", upload.single("profilePicture"), updateuser);
router.get("/getuser/:email", getUser);
router.get("/getThoughts", getThoughts);
router.post("/saveThought", saveThought);
router.get("/getSavedThoughts/:userId", getSavedThoughts);
router.post("/saveMyThoughts", saveMyThoughts);
router.get("/getMyThoughts/:userId", getMyThoughts);
router.delete("/deleteThought/:userId/:index", deleteThought);
router.delete("/deleteThought/:userId/:index", deleteSaved);
router.delete("/deleteFavoriteById/:userId/:index", deleteFavorite);
router.post("/saveMyFavorites", saveMyFavorites);
router.get("/getMyFavorites/:userId", getMyFavorites);
router.get("/getAllThoughts", getAllThoughts);
router.post("/saveLikedThoughts", saveLikedThought);
router.get("/getLikedThoughts/:userId", getLikedThoughts);
router.delete("/deleteSavedById/:userId/:index", deleteSaved);
router.get("/getPunjabiThoughts", getPunjabiThoughts);
router.get("/getHindiThoughts", getHindiThoughts);
router.post("/saveReadThought", saveReadThought);
router.post("/getReadThought", getReadThought);

router.post("/getAiThought", getAiThought);
export default router;

