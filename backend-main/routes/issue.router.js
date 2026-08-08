const express = require("express");
const issueController = require("../controllers/issueController");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const { authorizeIssueRepoOwner } = require("../middleware/authorizeMiddleware");

const issueRouter = express.Router();

issueRouter.post("/issue/create/:id", authMiddleware, issueController.createIssue);
issueRouter.get("/issue/all/:id", optionalAuth, issueController.getAllIssues);
issueRouter.get("/issue/:id", optionalAuth, issueController.getIssueById);
issueRouter.put("/issue/update/:id", authMiddleware, authorizeIssueRepoOwner, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authMiddleware, authorizeIssueRepoOwner, issueController.deleteIssueById);

module.exports = issueRouter;
