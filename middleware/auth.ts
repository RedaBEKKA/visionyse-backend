import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/user.model"

interface AuthRequest extends Request {
  auth?: { id: string; user?: any }
}

interface JwtPayload {
  id: string
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const bearerToken = token.substring(7)

  try {
    // Décoder le token
    const decodedToken = jwt.verify(
      bearerToken,
      process.env.JWT_SECRET as string
    ) as JwtPayload

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(decodedToken.id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Unauthorized, User not found" })
    }

    req.auth = { id: decodedToken.id, user: user }
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" })
  }
}

export default authMiddleware
