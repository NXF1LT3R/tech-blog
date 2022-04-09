// import all models
const Post = require("./Post");
const User = require("./User");
const Comment = require("./Comment");

// create associations
User.hasMany(Post, {
  foreignKey: "username",
});

Post.belongsTo(User, {
  foreignKey: "username",
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "username",
  onDelete: "CASCADE",
});

Comment.belongsTo(Post, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
});

User.hasMany(Comment, {
  foreignKey: "username",
  onDelete: "CASCADE",
});

Post.hasMany(Comment, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
});

module.exports = { User, Post, Comment };