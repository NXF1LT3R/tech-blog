const router = require("express").Router();
const { Post, User, Comment } = require("../models");
const { check, validationResult } = require("express-validator/check");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// get all posts for homepage
router.get("/", (req, res) => {
  console.log("======================");
  Post.findAll({
    attributes: [
      "id",
      "title"
    ],
    include: [
      {
        model: Comment,
        attributes: ["id", "text", "post_id", "username"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      const posts = dbPostData.map((post) => post.get({ plain: true }));
      res.render("homepage", {
        posts,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/post/:id", (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: [
      "id",
      "title"
    ],
    include: [
      {
        model: Comment,
        attributes: ["id", "text", "post_id", "username"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }

      const post = dbPostData.get({ plain: true });

      res.render("single-post", {
        post,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

router.post(
  "/search",
  // check(req.param.term).isLength({ min: 1 }).trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    Post.findAll({
      where: {
        title: {
          [Op.like]: "%" + req.body.searchTerm + "%",
        },
      },
    }).then((searchResults) => {
      console.log(searchResults[0]);
      const posts = searchResults.map((result) => result.get({ plain: true }));
      res.render("homepage", posts);
    });
  }
);

module.exports = router;