const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function authorizeRepoOwner(req, res, next) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid repository id." });
  }

  try {
    const repository = await Repository.findById(id).select("owner");
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    if (repository.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to modify this repository." });
    }
    next();
  } catch (err) {
    console.error("Error during repository authorization: ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function authorizeIssueRepoOwner(req, res, next) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid issue id." });
  }

  try {
    const issue = await Issue.findById(id).select("repository");
    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    const repository = await Repository.findById(issue.repository).select("owner");
    if (!repository || repository.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to modify this issue." });
    }
    next();
  } catch (err) {
    console.error("Error during issue authorization: ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

function authorizeSelf(req, res, next) {
  const { id } = req.params;
  if (id !== req.userId) {
    return res.status(403).json({ error: "You do not have permission to modify this profile." });
  }
  next();
}

module.exports = { authorizeRepoOwner, authorizeIssueRepoOwner, authorizeSelf };
