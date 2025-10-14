import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Staff from "../models/Staff.js";
import Resident from "../models/Resident.js";
import { registerValidation } from "../validations/userValidation.js";
import Bin from "../models/Bin.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, contactNumber, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;

    switch (role) {
      case "admin":
        newUser = new Admin({ ...req.body, password: hashedPassword });
        break;
      case "staff":
        newUser = new Staff({ ...req.body, password: hashedPassword });
        break;
      case "resident":
        newUser = new Resident({ ...req.body, password: hashedPassword });
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();
    
    if (role === "resident") {
      try {
        const types = [
          { wasteType: "hazardous", code: "HZ" },
          { wasteType: "ewaste", code: "EW" },
          { wasteType: "plastic", code: "PL" },
          { wasteType: "glass", code: "GL" },
        ];
        const now = Date.now();
        const base = String(newUser._id).slice(-4).toUpperCase();
        const docs = types.map((t, idx) => ({
          binId: `BIN-${t.code}-${base}-${(now + idx).toString(36).toUpperCase().slice(-4)}`,
          resident: newUser._id,
          wasteType: t.wasteType,
        }));
        await Bin.insertMany(docs);
      } catch (e) {
        console.error("Failed to auto-create bins for resident:", e);
      }
    }

    res.status(201).json({ message: `${role} registered successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const { id, role } = req.user || {};
    const models = { admin: Admin, staff: Staff, resident: Resident };
    const Model = models[role];
    if (!Model) return res.status(400).json({ message: "Invalid role" });
    const projection = role === 'resident'
      ? 'name email role streetAddress city postalCode contactNumber'
      : 'name email role contactNumber';
    const user = await Model.findById(id).select(projection);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const models = { admin: Admin, staff: Staff, resident: Resident };
    const Model = models[role];
    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
