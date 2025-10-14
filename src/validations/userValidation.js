import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  contactNumber: Joi.string().required(),
  role: Joi.string().valid("admin", "staff", "resident").required(),
  
  // For admins
  adminId: Joi.string().when("role", { is: "admin", then: Joi.required() }),
  department: Joi.string().when("role", { is: "admin", then: Joi.required() }),
  accessLevel: Joi.string().when("role", { is: "admin", then: Joi.required() }),
  assignedRegion: Joi.string().when("role", { is: "admin", then: Joi.required() }),
  authorizationCode: Joi.string().when("role", { is: "admin", then: Joi.required() }),
  systemPermissions: Joi.object({
    userManagement: Joi.boolean().default(false),
    financialReports: Joi.boolean().default(false),
    policyManagement: Joi.boolean().default(false),
    systemConfiguration: Joi.boolean().default(false),
    dataAnalytics: Joi.boolean().default(false),
    emergencyOverride: Joi.boolean().default(false)
  }).when("role", {
    is: "admin",
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),

  // For resident
  residentType: Joi.string().when("role", { is: "resident", then: Joi.required() }),
  streetAddress: Joi.string().when("role", { is: "resident", then: Joi.required() }),
  city: Joi.string().when("role", { is: "resident", then: Joi.required() }),
  postalCode: Joi.string().when("role", { is: "resident", then: Joi.required() }),
  bankAccountNumber: Joi.string().when("role", { is: "resident", then: Joi.required() }),
  numberOfBins: Joi.number().when("role", { is: "resident", then: Joi.required() }),

  // For staff
  emergencyContact: Joi.string().when("role", { is: "staff", then: Joi.required() }),
  employeeId: Joi.string().when("role", { is: "staff", then: Joi.required() }),
  department: Joi.string().when("role", { is: "staff", then: Joi.required() }),
  workLocation: Joi.string().when("role", { is: "staff", then: Joi.required() }),
  prefferedShift: Joi.string().when("role", { is: "staff", then: Joi.required() }),
  drivingLicenseNumber: Joi.string().when("role", { is: "staff", then: Joi.required() }),
});