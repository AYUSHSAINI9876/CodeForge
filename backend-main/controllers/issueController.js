const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function canView(repository, userId) {
  if (repository.visibility) return true;
  return userId && repository.owner.toString() === userId;
}

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { id } = req.params;

  if (!title || !title.trim() || !description || !description.trim()) {
    return res.status(400).json({ error: "Title and description are required." });
  }
  if (!isValidId(id)) {
    return res.status(404).json({ error: "Repository not found!" });
  }

  try {
    const repository = await Repository.findById(id).select("owner visibility issues");
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    if (!(await canView(repository, req.userId))) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const issue = new Issue({ title: title.trim(), description: description.trim(), repository: id });
    await issue.save();

    repository.issues.push(issue._id);
    await repository.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error("Error during issue creation : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;

    await issue.save();

    res.json({ message: "Issue updated", issue });
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    await Repository.findByIdAndUpdate(issue.repository, { $pull: { issues: id } });

    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function getAllIssues(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Repository not found!" });
  }

  try {
    const repository = await Repository.findById(id).select("owner visibility");
    if (!repository || !(await canView(repository, req.userId))) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const issues = await Issue.find({ repository: id }).sort({ createdAt: -1 }).lean();
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    const repository = await Repository.findById(issue.repository).select("owner visibility");
    if (!repository || !(await canView(repository, req.userId))) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
