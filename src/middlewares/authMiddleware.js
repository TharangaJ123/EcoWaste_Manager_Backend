 import jwt from "jsonwebtoken";

 export const protect = (req, res, next) => {
   try {
     const authHeader = req.headers.authorization || "";
     const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
     if (!token) return res.status(401).json({ message: "Not authorized, no token" });

     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = { id: decoded.id, role: decoded.role };
     next();
   } catch (err) {
     return res.status(401).json({ message: "Not authorized, token failed" });
   }
 };

 export const authorize = (...allowedRoles) => (req, res, next) => {
   if (!req.user || !allowedRoles.includes(req.user.role)) {
     return res.status(403).json({ message: "Forbidden: insufficient permissions" });
   }
   next();
 };

