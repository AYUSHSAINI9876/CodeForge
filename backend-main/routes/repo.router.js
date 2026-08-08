const express = require("express");
const repoController = require("../controllers/repoController");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const { authorizeRepoOwner } = require("../middleware/authorizeMiddleware");

const repoRouter = express.Router();

repoRouter.post("/repo/create", authMiddleware, repoController.createRepository);
repoRouter.get("/repo/all", optionalAuth, repoController.getAllRepositories);
repoRouter.get("/repo/name/:name", optionalAuth, repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", optionalAuth, repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/:id", optionalAuth, repoController.fetchRepositoryById);
repoRouter.put("/repo/update/:id", authMiddleware, authorizeRepoOwner, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", authMiddleware, authorizeRepoOwner, repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", authMiddleware, authorizeRepoOwner, repoController.toggleVisibilityById);
repoRouter.patch("/repo/:id/star", authMiddleware, repoController.toggleStarRepository);

module.exports = repoRouter;
