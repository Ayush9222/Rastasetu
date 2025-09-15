const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const { getUserFromRequest } = require("../util/auth");

router.get("/", postsController.getPosts);
router.post("/", getUserFromRequest, postsController.createPost);
router.get("/:id", postsController.getPost);
router.put("/:id", getUserFromRequest, postsController.updatePost);
router.delete("/:id", getUserFromRequest, postsController.deletePost);

module.exports = router;
