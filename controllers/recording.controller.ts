import { Request, Response } from "express"
import Recording from "../models/recording.model"
import axios from "axios"
import mongoose from "mongoose"
interface AuthRequest extends Request {
  auth?: { id: string; user: any }
}

export const createRecording = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.user?._id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const name = req.body.name

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Recording name is required" })
    }

    const existingRecording = await Recording.findOne({ name, user: userId })
    if (existingRecording) {
      return res
        .status(400)
        .json({ message: "Recording with this name already exists" })
    }

    const newRecording = new Recording({
      name,
      filePath: req.file.path.replace(/\\/g, "/"),
      user: userId,
    })

    await newRecording.save()

    res.status(201).json({
      message: "Recording saved successfully",
      recording: newRecording,
    })
  } catch (error) {
    console.error("createRecording error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getAllRecordings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.user._id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5

    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ error: "Page and limit must be positive integers" })
    }

    const totalItems = await Recording.countDocuments({ user: userId })

    const recordings = await Recording.find({ user: userId })
      .select("-__v -transcriptionResult")
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "fullName email")
      .lean()

    const numberOfPages = Math.ceil(totalItems / limit)
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`

    const next =
      page < numberOfPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
    const prev = page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null

    res.status(200).json({
      page,
      pages: numberOfPages,
      next,
      prev,
      limit,
      totalItems,
      data: recordings,
    })
  } catch (error) {
    console.error("getAllRecordings error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getRecordingById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.user?._id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(req.params.id))
      return res
        .status(400)
        .json({ message: "ID is required and must be a valid ObjectId" })

    const recording = await Recording.findOne({
      _id: id,
      user: userId,
    })
      .select("-__v")
      .populate("user", "fullName email")

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" })
    }

    res.status(200).json({
      data: recording,
    })
  } catch (error) {
    console.error("getRecordingById error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const deleteRecordingById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.user?._id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(req.params.id))
      return res
        .status(400)
        .json({ message: "ID is required and must be a valid ObjectId" })

    const recording = await Recording.findOne({ _id: id, user: userId })

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" })
    }

    await Recording.deleteOne({ _id: id })

    res.status(201).json({ message: "Recording deleted successfully" })
  } catch (error) {
    console.error("deleteRecordingById error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const createTranscription = async (req: AuthRequest, res: Response) => {
  const userId = req.auth?.user?._id
  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(req.params.id))
      return res
        .status(400)
        .json({ message: "ID is required and must be a valid ObjectId" })

    const recording = await Recording.findOne({ _id: id, user: userId }).select(
      "-__v"
    )

    if (!recording) {
      return res.status(404).json({ message: "Audio not found." })
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`
    const fileUrl = `${baseUrl}${recording.filePath.replace("/tmp", "")}`

    const response = await axios.post(
      "https://api.gladia.io/v2/pre-recorded",
      {
        language: "en",
        audio_url: fileUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-gladia-key": process.env.GLADIA_API_KEY as string,
        },
      }
    )

    const { id: gladiaId, result_url } = response.data
    recording.gladiaId = gladiaId
    recording.gladiaResultUrl = result_url
    await recording.save()

    res.status(200).json({
      message: "Transcription request sent to Gladia",
      data: recording,
    })
  } catch (error: any) {
    console.error(error.response?.data?.message)
    res.status(500).json({
      message: "Error creating transcription",
      error: error.response?.data?.message || error.message,
    })
  }
}

export const getTranscriptionResult = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.auth?.user._id
  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(req.params.id))
      return res
        .status(400)
        .json({ message: "ID is required and must be a valid ObjectId" })

    const recording = await Recording.findOne({ _id: id, user: userId })
      .select("-__v")
      .populate("user", "fullName email")

    if (!recording) {
      return res.status(404).json({ message: "Recording not found." })
    }

    if (!recording.gladiaId || !recording.gladiaResultUrl) {
      return res
        .status(400)
        .json({ message: "No transcription has been requested yet." })
    }

    const gladiaResponse = await axios.get(`${recording.gladiaResultUrl}`, {
      headers: {
        "x-gladia-key": process.env.GLADIA_API_KEY as string,
      },
    })

    const result = gladiaResponse?.data

    recording.transcriptionResult = result
    await recording.save()

    res.status(200).json({
      message: "Transcription result retrieved",
      // result,
      data: recording,
    })
  } catch (error: any) {
    console.error(error.response?.data || error.message)
    res.status(500).json({
      message: "Error retrieving transcription result",
      error: error.response?.data || error.message,
    })
  }
}
