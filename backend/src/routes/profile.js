const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { getUserFromRequest } = require("../util/auth");

router.get("/", getUserFromRequest, profileController.getProfile);
router.put("/", getUserFromRequest, profileController.updateProfile);


module.exports = router;
