import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Staff from "../models/Staff.js";
import Resident from "../models/Resident.js";
import { registerValidation } from "../validations/userValidation.js";
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
    // await sendEmail(email, "Registration Successful", `Welcome ${name}! Your ${role} account is created.`);

    res.status(201).json({ message: `${role} registered successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
