import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
