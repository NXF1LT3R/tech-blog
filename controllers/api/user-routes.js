const router = require("express").Router();
const { User, Post, Comment } = require("../../models");
const { check, validationResult } = require("express-validator/check");

// get all users
router.get("/", (req, res) => {
  User.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/:username", (req, res) => {
  User.findOne({
    attributes: { exclude: ["password"] },
    where: {
      username: req.params.username,
    },
    include: [
      {
        model: Post,
        attributes: ["id", "title"],
      },
      {
        model: Comment,
        attributes: ["id", "text"],
        include: {
          model: Post,
          attributes: ["title"],
        },
      },
    ],
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post(
  "/",
  [
    check("password", "Password must be at least five characters long")
      .exists()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    check("username", "Username cannot be empty")
      .exists()
      .trim()
      .not()
      .isEmpty()
      .escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    User.create({
      username: req.body.username,
      password: req.body.password,
    })
      .then((dbUserData) => {
        req.session.save(() => {
          req.session.user_id = dbUserData.username;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;

          res.json(dbUserData);
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  }
);

router.post(
  "/login",
  [check("username").exists().escape(), check("password").escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    User.findOne({
      where: {
        username: req.body.username,
      },
    }).then((dbUserData) => {
      if (!dbUserData) {
        res.status(400).json({ message: "No user with that username!" });
        return;
      }

      const validPassword = dbUserData.checkPassword(req.body.password);

      if (!validPassword) {
        res.status(400).json({ message: "Incorrect password!" });
        return;
      }

      req.session.save(() => {
        req.session.user_id = dbUserData.username;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json({ user: dbUserData, message: "You are now logged in!" });
      });
    });
  }
);

router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.delete("/:username", (req, res) => {
  User.destroy({
    where: {
      username: req.params.username,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this username!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;