import User from "../models/userModel.js"
import Thought from "../models/thoughtModel.js"
import Saved from "../models/savedModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MyThoughts from "../models/myThoughts.js";
import MyFavorites from "../models/favoriteThoughts.js";
import AllThought from "../models/allthoughtModel.js";
import Liked from "../models/likedThoughts.js";
import PunjabThought from "../models/punjabiThought.js";
import HindiThought from "../models/hindiThought.js";
import ReadThought from "../models/readThoughtCount.js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const SERVER_URL = "https://mindversebackend-1-f4oh.onrender.com";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    const profilePicture = req.file; // from multer
    // Validation
    if (!name || !email || !password||!bio||! profilePicture) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bio,
      profilePicture: `/uploads/${profilePicture.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, bio: user.bio, profilePicture: `${SERVER_URL}/uploads/${profilePicture.filename}`, },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    console.log("Step1");
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getUser = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User found", user: user });
  }
  catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const {password,email}=req.body;
    const user = await User.findOne({ email });
    const userId=user._id;
    console.log(user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
        
    if (user.profilePicture) {
      const filePath = path.join(process.cwd(), user.profilePicture);

      // Check if file exists, then delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Profile picture deleted:", filePath);
      } else {
        console.log("Profile picture not found:", filePath);
      }
    }
    await Saved.deleteOne({ userId });
    await Liked.deleteOne({ userId });
    await MyThoughts.deleteOne({ userId });
    await MyFavorites.deleteOne({ userId });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updatepassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully" });
  }
  catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateuser = async (req,res)=>{
  try {
    const {email,name,bio}=req.body;
    const profilePicture = req.file; // from multer - only present if new image uploaded
    const user=await User.findOne({email});
    if(!user){
      return res.status(404).json({success:false,message:"User not found"});
    }
    user.name = name;
    user.bio = bio;
    // Only update profilePicture if a new file was uploaded
    if (profilePicture) {
      user.profilePicture = `/uploads/${profilePicture.filename}`;
    }
    // If no new image uploaded, keep existing profilePicture
    await user.save();
    res.status(200).json({success:true,message:"User updated successfully"});
  } catch (error) {
  console.error("Update user error:", error);
  res.status(500).json({ success: false, message: "Server error" });
}
}

export const getThoughts = async (req,res)=>{
  try {
    const thoughts = await Thought.find();
    res.status(200).json({success:true,message:"Thoughts fetched successfully",thoughts:thoughts});
  } catch (error) {
    console.error("Get thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


export const saveThought = async (req, res) => {
  try {
    const { userId, thought, writer } = req.body;

    if (!userId || !thought || !writer) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find saved document for this user
    let saved = await Saved.findOne({ userId });

    if (!saved) {
      // ✅ Correct way to create with array
      const savedThought = await Saved.create({
        userId,
        thoughts: [{ text: thought, writer }],
      });
      return res.status(200).json({
        success: true,
        message: "Thought saved successfully",
        savedThought,
      });
    }

    // Check duplicate
    const duplicate = saved.thoughts.some(
      (item) => item.text === thought && item.writer === writer
    );
    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: "Thought already saved",
        savedThought: saved,
      });
    }

    // ✅ Push new thought to the array
    saved.thoughts.push({ text: thought, writer });
    await saved.save();

    res.status(200).json({
      success: true,
      message: "Thought saved successfully",
      savedThought: saved,
    });
  } catch (error) {
    console.error("Save thought error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSavedThoughts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const savedThoughts = await Saved.find({ userId });
    res.status(200).json({ success: true, message: "Saved thoughts fetched successfully", savedThoughts });
  } catch (error) {
    console.error("Get saved thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const saveMyThoughts = async (req, res) => {
  try {
    const { userId, title, content, mood } = await req.body;
    console.log(userId,title)

    if (!userId || !title || !content || !mood) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, title, content, mood)",
      });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("Not Exists")
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let userThoughts = await MyThoughts.findOne({ userId });

    if(userThoughts&&userThoughts.thoughts.some((t) => t.title === title && t.content === content)){
      return res.status(400).json({
        success: false,
      message: "This content already exists in your collection.",
      })
    }

    if (!userThoughts) {
      userThoughts = await MyThoughts.create({
        userId,
        thoughts: [{ title, content, mood }],
      });
    } else {
      userThoughts.thoughts.push({ title, content, mood });
      await userThoughts.save();
    }

    return res.status(200).json({
      success: true,
      message: "Thought saved successfully",
      thoughts: userThoughts.thoughts,
    });
  } catch (error) {
    console.error("Save my thoughts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getMyThoughts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Jashan",userId);
    const thought = await MyThoughts.findOne({ userId: userId });

    if (!thought) {
      return res.status(404).json({
        success: false,
        message: "No thoughts found for this user",
      });
    }

    res.status(200).json({
      success: true,
      thoughts: thought.thoughts,
    });
  } catch (err) {
    console.error("Fetch thoughts error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const deleteThought = async (req, res) => {
  try {
    const { userId, index } = req.params;

    if (!userId || index === undefined) {
      return res.status(400).json({ message: "User ID or index missing" });
    }

    const thoughtDoc = await MyThoughts.findOne({ userId });
    if (!thoughtDoc) {
      return res.status(404).json({ message: "Thought document not found" });
    }

    thoughtDoc.thoughts.splice(index, 1);

    await thoughtDoc.save();

    res.status(200).json({ message: "Thought deleted successfully" });
  } catch (error) {
    console.error("Delete thought error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const saveMyFavorites = async (req, res) => {
  try {
    const { userId, thought, writer } = req.body;

    if (!userId || !thought || !writer) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find saved document for this user
    let saved = await MyFavorites.findOne({ userId });

    if (!saved) {
      // ✅ Correct way to create with array
      const savedThought = await MyFavorites.create({
        userId,
        thoughts: [{ text: thought, writer }],
      });
      return res.status(200).json({
        success: true,
        message: "Thought saved successfully",
        savedThought,
      });
    }

    // Check duplicate
    const duplicate = saved.thoughts.some(
      (item) => item.text === thought && item.writer === writer
    );
    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: "Thought already saved",
        savedThought: saved,
      });
    }

    // ✅ Push new thought to the array
    saved.thoughts.push({ text: thought, writer });
    await saved.save();

    res.status(200).json({
      success: true,
      message: "Thought saved successfully",
      savedThought: saved,
    });
  } catch (error) {
    console.error("Save thought error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getMyFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const FavoriteThoughts = await MyFavorites.find({ userId });
    res.status(200).json({ success: true, message: " Thoughts fetched successfully", FavoriteThoughts });
  } catch (error) {
    console.error("Get saved thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


export const deleteFavorite = async (req, res) => {
  try {
    const { userId, index } = req.params;

    if (!userId || index === undefined) {
      return res.status(400).json({ message: "User ID or index missing" });
    }

    const thoughtDoc = await MyFavorites.findOne({ userId });
    if (!thoughtDoc) {
      return res.status(404).json({ message: "Thought document not found" });
    }

    thoughtDoc.thoughts.splice(index, 1);

    await thoughtDoc.save();

    res.status(200).json({ message: "Thought deleted successfully" });
  } catch (error) {
    console.error("Delete thought error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getAllThoughts = async (req,res)=>{
  try {
    const thoughts = await AllThought.find();
    res.status(200).json({success:true,message:"Thoughts fetched successfully",thoughts:thoughts});
  } catch (error) {
    console.error("Get thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


export const saveLikedThought = async (req, res) => {
  try {
    const { userId, thought, writer } = req.body;

    if (!userId || !thought || !writer) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find saved document for this user
    let liked = await Liked.findOne({ userId });

    if (!liked) {
      // ✅ Correct way to create with array
      const likedThought = await Liked.create({
        userId,
        thoughts: [{ text: thought, writer }],
      });
      return res.status(200).json({
        success: true,
        message: "Thought liked successfully",
        likedThought,
      });
    }

    // Check duplicate
    const duplicate = liked.thoughts.some(
      (item) => item.text === thought && item.writer === writer
    );
    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: "Thought already liked",
        savedThought: liked,
      });
    }

    // ✅ Push new thought to the array
    liked.thoughts.push({ text: thought, writer });
    await liked.save();

    res.status(200).json({
      success: true,
      message: "Thought liked successfully",
      savedThought: liked,
    });
  } catch (error) {
    console.error("Save thought error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getLikedThoughts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const LikedThoughts = await Liked.find({ userId });
    res.status(200).json({ success: true, message: "Liked thoughts fetched successfully", LikedThoughts });
  } catch (error) {
    console.error("Get liked thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



export const deleteSaved = async (req, res) => {
  try {
    const { userId, index } = req.params;

    if (!userId || index === undefined) {
      return res.status(400).json({ message: "User ID or index missing" });
    }

    const thoughtDoc = await Saved.findOne({ userId });
    if (!thoughtDoc) {
      return res.status(404).json({ message: "Thought document not found" });
    }

    thoughtDoc.thoughts.splice(index, 1);

    await thoughtDoc.save();

    res.status(200).json({ message: "Thought deleted successfully" });
  } catch (error) {
    console.error("Delete thought error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPunjabiThoughts = async (req,res)=>{
  try {
    const thoughts = await PunjabThought.find();
    res.status(200).json({success:true,message:"Thoughts fetched successfully",thoughts:thoughts});
  } catch (error) {
    console.error("Get thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getHindiThoughts = async (req,res)=>{
  try {
    const thoughts = await HindiThought.find();
    res.status(200).json({success:true,message:"Thoughts fetched successfully",thoughts:thoughts});
  } catch (error) {
    console.error("Get thoughts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const saveReadThought = async (req, res) => {
  try {
    const { userId, readThought } = req.body;
    console.log(readThought)

    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    // Update or create user
    const Thought = await ReadThought.findOneAndUpdate(
      { userId },
      { readThought },
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "readThought saved successfully",
      data: Thought,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getReadThought= async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    const thoughtCount = await ReadThought.findOne({ userId });

    if (!thoughtCount) {
      return res.status(200).json({ readThought: 0 }); // default
    }

    res.status(200).json({ readThought: thoughtCount.readThought });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}



const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function getAiThought(req, res) {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({ msg: "userId and prompt required" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You only give ONE short, calm, positive motivational thought. No advice, no explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    const aiThought =
      data.choices?.[0]?.message?.content ??
      "🌱 Stay calm and trust your journey.";

    return res.status(200).json({
      aiThought,
    });
  } catch (err) {
    return res.status(500).json({ msg: "AI error", error: err.message });
  }
}


