const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../middlewares/is-authorized");
const pwdCtrl = require("../controllers/passwords");

const router = express.Router();

// GET /: Fetch all passwords
router.get("/", isAuth, pwdCtrl.getPasswords);

// GET: /password/:passwordId: Fetch one password
router.get("/password/:passwordId", isAuth, pwdCtrl.getPassword);

// GET /export: Fetch all the passwords as a json file
router.get("/export", isAuth, pwdCtrl.exportPasswords);

// GET /password?search=text: Fetch password searched with fuzzy search
router.get("/password", isAuth, pwdCtrl.searchPassword);

// POST /: Create a new password
router.post(
  "/",
  isAuth,
  [
    body("name")
      .notEmpty()
      .withMessage("Please enter a name which describes this password"),
    body("password").notEmpty().withMessage("Please enter a password"),
  ],
  pwdCtrl.createPassword
);

// POST /import: Import passwords from file
router.post("/import", isAuth, pwdCtrl.importFromFile);

// PUT /password/:passwordId: Update one password
router.put(
  "/password/:passwordId",
  isAuth,
  [
    body("name").notEmpty().withMessage("Please enter a name."),
    body("password").notEmpty().withMessage("Please enter a password."),
  ],
  pwdCtrl.updatePassword
);

// Delete a password
router.delete("/password/:passwordId", isAuth, pwdCtrl.deletePassword);

module.exports = router;
