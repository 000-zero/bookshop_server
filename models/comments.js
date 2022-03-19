const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Comments extends Model { }//创建一个类,继承Model
Comments.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  parentId: DataTypes.INTEGER,
  goods_id: DataTypes.INTEGER,
  content: DataTypes.STRING,
  likeNum:DataTypes.INTEGER,
}, { sequelize, modelName: 'Comments',tableName: 'comments' })


module.exports = Comments