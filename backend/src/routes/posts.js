const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const { verifyAuthToken } = require("../middleware/auth");

router.get("/", verifyAuthToken, postsController.getPosts);
router.post("/", verifyAuthToken, postsController.createPost);
router.get("/:id", verifyAuthToken, postsController.getPost);
router.put("/:id", verifyAuthToken, postsController.updatePost);
router.delete("/:id", verifyAuthToken, postsController.deletePost);
router.post("/:id/like", verifyAuthToken, postsController.likePost);

module.exports = router;
