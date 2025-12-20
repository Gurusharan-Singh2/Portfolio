import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  dailyQuizCount: { type: Number, default: 0 },
  lastQuizDate: { type: Date, default: Date.now },
  isSubscribed: { type: Boolean, default: false },
  subscriptionId: { type: String },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
