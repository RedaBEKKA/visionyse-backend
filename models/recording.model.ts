import mongoose, { Document, Schema } from "mongoose"

export interface IRecording extends Document {
  name: string
  filePath: string
  user: mongoose.Types.ObjectId
  createdAt: Date
  gladiaId?: string
  gladiaResultUrl?: string
  transcriptionResult?: any
}

const recordingSchema = new Schema<IRecording>({
  name: { type: String, required: true },
  filePath: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gladiaId: { type: String },
  gladiaResultUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  transcriptionResult: { type: Schema.Types.Mixed },
})

export default mongoose.model<IRecording>("Recording", recordingSchema)
