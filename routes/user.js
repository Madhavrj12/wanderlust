const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.get("/signup",userController.userPage);

router.post("/signup",wrapAsync(userController.userSignup));

router.get("/login",userController.userLoginPage);

router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash: true}), userController.userLogin);

router.get("/logout",userController.userLogout);



module.exports = router;