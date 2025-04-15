import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model"

const JWT_SECRET = process.env.JWT_SECRET

interface AuthRequest extends Request {
  auth?: { id: string }
}

export const register = async (req: Request, res: Response) => {
  const { fullName, email, pseudo, password, confirmPassword } = req.body

  if (!fullName || !email || !pseudo || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill in all the fields." })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." })
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: "This email is already in use." })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = new User({
    fullName,
    email,
    pseudo,
    password: hashedPassword,
  })

  await newUser.save()

  res.status(201).json({ message: "User registered successfully." })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found." })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect password." })
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  })
  const { password: _, ...userWithoutPassword } = user.toObject()

  res.status(201).json({ user: userWithoutPassword, token })
}

export const editProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ message: "User not found" })

    const {
      pseudo,
      fullName,
      email,
      newPassword,
      oldPassword,
      confirmPassword,
    } = req.body

    if (pseudo) {
      user.pseudo = pseudo
    }

    if (fullName) {
      user.fullName = fullName
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" })
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }

      user.email = email
    }

    if (newPassword) {
      if (!oldPassword || !confirmPassword) {
        return res
          .status(400)
          .json({ message: "Old and confirm password are required" })
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" })
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "New password and confirm password do not match" })
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      user.password = hashedPassword
    }

    await user.save()

    const { password, ...userWithoutPassword } = user.toObject()

    res.status(201).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("editProfile error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
