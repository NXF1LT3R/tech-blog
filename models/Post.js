const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
// create our Post model
class Post extends Model {

}

// create fields/columns for Post model
Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      references: {
        model: "user",
        key: "username",
      },
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    }
  },
  {
    sequelize,
    underscored: true,
    modelName: "post",
    freezeTableName: true,
  }
);

module.exports = Post;