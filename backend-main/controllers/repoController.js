const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");

const OWNER_FIELDS = "username email";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createRepository(req, res) {
  const { name, description, visibility, content } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    const newRepository = new Repository({
      name: name.trim(),
      description,
      visibility: visibility !== false,
      owner: req.userId,
      content: content || [],
      issues: [],
    });

    const result = await newRepository.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { repositories: result._id } });

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
      repository: result,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "A repository with that name already exists." });
    }
    console.error("Error during repository creation : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function getAllRepositories(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const [repositories, total] = await Promise.all([
      Repository.find({ visibility: true })
        .populate("owner", OWNER_FIELDS)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Repository.countDocuments({ visibility: true }),
    ]);

    res.json({ page, limit, total, repositories });
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Repository not found!" });
  }

  try {
    const repository = await Repository.findById(id)
      .populate("owner", OWNER_FIELDS)
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const isOwner = req.userId && repository.owner?._id?.toString() === req.userId;
    if (!repository.visibility && !isOwner) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ ...repository.toObject(), isStarred: req.userId ? repository.stars.some((s) => s.toString() === req.userId) : false, starCount: repository.stars.length });
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.findOne({ name }).populate("owner", OWNER_FIELDS).populate("issues");
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const isOwner = req.userId && repository.owner?._id?.toString() === req.userId;
    if (!repository.visibility && !isOwner) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  if (!isValidId(userID)) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  try {
    const isOwner = req.userId && req.userId === userID;
    const filter = isOwner ? { owner: userID } : { owner: userID, visibility: true };

    const repositories = await Repository.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content !== undefined) repository.content.push(content);
    if (description !== undefined) repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    await User.updateMany(
      { $or: [{ repositories: id }, { starRepos: id }] },
      { $pull: { repositories: id, starRepos: id } }
    );

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function toggleStarRepository(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid repository id." });
  }

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const alreadyStarred = repository.stars.some((s) => s.toString() === req.userId);

    if (alreadyStarred) {
      repository.stars = repository.stars.filter((s) => s.toString() !== req.userId);
      await User.findByIdAndUpdate(req.userId, { $pull: { starRepos: id } });
    } else {
      repository.stars.push(req.userId);
      await User.findByIdAndUpdate(req.userId, { $addToSet: { starRepos: id } });
    }

    await repository.save();

    res.json({ starred: !alreadyStarred, starCount: repository.stars.length });
  } catch (err) {
    console.error("Error during star toggle : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  toggleStarRepository,
};
