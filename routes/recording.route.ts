import express from "express"
const router = express.Router()

import * as recordingController from "../controllers/recording.controller"
import auth from "../middleware/auth"
import { uploadRecording } from "../middleware/mullter"

/**
 * @swagger
 * /api/record/createRecording:
 *   post:
 *     tags:
 *       - Recording
 *     summary: Create a new recording
 *     description: Upload a new audio recording (multipart/form-data).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - name
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The audio file to upload
 *               name:
 *                 type: string
 *                 example: Mon enregistrement test
 *     responses:
 *       '201':
 *         description: Recording saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recording saved successfully
 *                 recording:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     user:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Missing file or name, or recording already exists
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post(
  "/createRecording",
  auth,
  uploadRecording.single("file"),
  recordingController.createRecording
)

/**
 * @swagger
 * /api/record/getAll:
 *   get:
 *     tags:
 *       - Recording
 *     summary: Get all recordings of the authenticated user (paginated)
 *     description: Retrieves all recordings for the authenticated user, paginated.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       '200':
 *         description: List of recordings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 next:
 *                   type: string
 *                   nullable: true
 *                 prev:
 *                   type: string
 *                   nullable: true
 *                 limit:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       filePath:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       gladiaId:
 *                         type: string
 *                         nullable: true
 *                       gladiaResultUrl:
 *                         type: string
 *                         nullable: true
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *       '400':
 *         description: Invalid pagination parameters
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll", auth, recordingController.getAllRecordings)

/**
 * @swagger
 * /api/record/getById/{id}:
 *   get:
 *     tags:
 *       - Recording
 *     summary: Get a single recording by ID
 *     description: Fetch a recording by its ID for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the recording
 *     responses:
 *       '200':
 *         description: Recording found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     gladiaId:
 *                       type: string
 *                       nullable: true
 *                     gladiaResultUrl:
 *                       type: string
 *                       nullable: true
 *                     transcriptionResult:
 *                       type: object
 *                       description: Transcription result object (structure dynamique)
 *                       additionalProperties: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid or missing ID
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Recording not found
 *       '500':
 *         description: Internal server error
 */
router.get("/getById/:id", auth, recordingController.getRecordingById)
/**
 * @swagger
 * /api/record/createTranscription/{id}:
 *   post:
 *     tags:
 *       - Recording
 *     summary: Request transcription for an existing recording
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the recording
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcription request sent to Gladia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recording'
 *       400:
 *         description: Invalid ID or transcription already requested
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recording not found
 *       500:
 *         description: Server error
 */
router.post(
  "/createTranscription/:id",
  auth,
  recordingController.createTranscription
)
/**
 * @swagger
 * /api/record/getTranscriptionResult/{id}:
 *   get:
 *     tags:
 *       - Recording
 *     summary: Get transcription result from Gladia
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the recording
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcription result retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recording'
 *       400:
 *         description: No transcription requested or invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recording not found
 *       500:
 *         description: Server error
 */
router.get(
  "/getTranscriptionResult/:id",
  auth,
  recordingController.getTranscriptionResult
)
/**
 * @swagger
 * /api/record/deleteById/{id}:
 *   delete:
 *     tags:
 *       - Recording
 *     summary: Delete a specific recording by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the recording
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Recording deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recording not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteById/:id", auth, recordingController.deleteRecordingById)

export default router
