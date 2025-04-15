import express from "express"
import * as userController from "../controllers/user.controller"
import auth from "../middleware/auth"

const router = express.Router()

/**
 *  @swagger
 *  /api/user/register:
 *    post:
 *      tags:
 *        - User
 *      summary: Register a new user
 *      description: Create a new user account with full name, email, pseudo, and password.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - fullName
 *                - email
 *                - pseudo
 *                - password
 *                - confirmPassword
 *              properties:
 *                fullName:
 *                  type: string
 *                  example: John Doe
 *                email:
 *                  type: string
 *                  example: john.doe@example.com
 *                pseudo:
 *                  type: string
 *                  example: johndoe123
 *                password:
 *                  type: string
 *                  example: mySecurePassword
 *                confirmPassword:
 *                  type: string
 *                  example: mySecurePassword
 *      responses:
 *        '201':
 *          description: User registered successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User registered successfully.
 *        '400':
 *          description: Bad request. Invalid input or user already exists.
 *        '500':
 *          description: Internal server error.
 */
router.post("/register", userController.register)

/**
 *  @swagger
 *  /api/user/login:
 *    post:
 *      tags:
 *        - User
 *      summary: User login and JWT token generation
 *      description: Authenticates a user and returns a JWT token.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - password
 *              properties:
 *                email:
 *                  type: string
 *                  example: john.doe@example.com
 *                password:
 *                  type: string
 *                  example: mySecurePassword
 *      responses:
 *        '201':
 *          description: User successfully logged in.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    type: object
 *                    description: The authenticated user details (excluding password).
 *                    properties:
 *                      _id:
 *                        type: string
 *                        example: 661d3f0f123abc7890ff4567
 *                      fullName:
 *                        type: string
 *                        example: John Doe
 *                      email:
 *                        type: string
 *                        example: john.doe@example.com
 *                      pseudo:
 *                        type: string
 *                        example: johndoe123
 *                  token:
 *                    type: string
 *                    description: JWT token to use for authenticated requests.
 *                    example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *        '400':
 *          description: Bad request. missing email or password, or incorrect password.
 *        '404':
 *          description: User not found with the provided email.
 *        '500':
 *          description: Internal server error.
 */
router.post("/login", userController.login)

/**
 *  @swagger
 *  /api/user/editProfile:
 *    put:
 *      tags:
 *        - User
 *      summary: Update the user's profile
 *      description: |
 *        Update the user's profile fields.
 *        All fields are optional.
 *        If `newPassword` is provided, then `oldPassword` and `confirmPassword` are **required**.
 *      security:
 *        - BearerAuth: []
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                pseudo:
 *                  type: string
 *                  example: newpseudo2024
 *                fullName:
 *                  type: string
 *                  example: New Name
 *                email:
 *                  type: string
 *                  example: new.email@example.com
 *                newPassword:
 *                  type: string
 *                  example: newPassword123
 *                oldPassword:
 *                  type: string
 *                  description: Required if newPassword is provided
 *                  example: oldPassword123
 *                confirmPassword:
 *                  type: string
 *                  description: Required if newPassword is provided
 *                  example: newPassword123
 *      responses:
 *        '201':
 *          description: Profile successfully updated.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Profile updated successfully
 *                  user:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        example: 661d3f0f123abc7890ff4567
 *                      fullName:
 *                        type: string
 *                        example: New Name
 *                      email:
 *                        type: string
 *                        example: new.email@example.com
 *                      pseudo:
 *                        type: string
 *                        example: newpseudo2024
 *        '400':
 *          description: Bad request. Invalid or missing data.
 *        '401':
 *          description: Unauthorized. User must be logged in.
 *        '500':
 *          description: Internal server error.
 */
router.put("/editProfile", auth, userController.editProfile)

export default router
