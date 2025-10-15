import Admin from "../models/Admin.js";
import Staff from "../models/Staff.js";
import Resident from "../models/Resident.js";

export const listUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const select = "-password -__v";

    const fetchByRole = async (r) => {
      if (r === "admin") return (await Admin.find({}, select)).map((u) => ({ ...u.toObject(), role: "admin" }));
      if (r === "staff") return (await Staff.find({}, select)).map((u) => ({ ...u.toObject(), role: "staff" }));
      if (r === "resident") return (await Resident.find({}, select)).map((u) => ({ ...u.toObject(), role: "resident" }));
      return [];
    };

    let users = [];
    if (role) {
      users = await fetchByRole(role);
    } else {
      const [admins, staffs, residents] = await Promise.all([
        fetchByRole("admin"),
        fetchByRole("staff"),
        fetchByRole("resident"),
      ]);
      users = [...admins, ...staffs, ...residents];
    }

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const models = [Admin, Staff, Resident];
    for (const Model of models) {
      const found = await Model.findById(id, "-password -__v");
      if (found) return res.json({ user: found });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const models = [Admin, Staff, Resident];
    for (const Model of models) {
      const found = await Model.findById(id);
      if (found) {
        await Model.findByIdAndDelete(id);
        return res.json({ message: "User deleted" });
      }
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    delete update.password;

    const options = { new: true, runValidators: true, select: "-password -__v" };
    const models = [Admin, Staff, Resident];
    for (const Model of models) {
      const updated = await Model.findByIdAndUpdate(id, update, options);
      if (updated) return res.json({ user: updated });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
