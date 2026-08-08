const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeSelf } = require("../middleware/authorizeMiddleware");

const userRouter = express.Router();

// Public
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/login/verify-otp", userController.verifyLoginOtp);
userRouter.post("/login/resend-otp", userController.resendLoginOtp);
userRouter.get("/userProfile/:id", userController.getUserProfile);

// Authenticated
userRouter.get("/allUsers", authMiddleware, userController.getAllUsers);
userRouter.get("/me", authMiddleware, userController.getMe);
userRouter.patch("/user/:id/follow", authMiddleware, userController.toggleFollowUser);
userRouter.put("/updateProfile/:id", authMiddleware, authorizeSelf, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authMiddleware, authorizeSelf, userController.deleteUserProfile);

module.exports = userRouter;
