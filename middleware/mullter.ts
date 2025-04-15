import multer from "multer"
import path from "path"
import fs from "fs"

const uploadDir = "/tmp/uploads/recordings"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = "/tmp/uploads/recordings"
    cb(null, folder)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_")
    const uniqueName = `${Date.now()}-${baseName}${ext}`
    cb(null, uniqueName)
  },
})

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/vnd.wave",
    "video/mp4",
    "video/webm",
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only audio and video files are allowed"))
  }
}

export const uploadRecording = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
})
