import mongoose, { Document, Schema } from "mongoose"

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true },
  password: { type: String, required: true },
})

export default mongoose.model("User", userSchema)
