const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class HasLike extends Model { }//创建一个类,继承Model
HasLike.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  comment_id: DataTypes.INTEGER,
  hasLike:DataTypes.BOOLEAN,
}, { sequelize, modelName: 'HasLike',tableName: 'hasLike' })


module.exports = HasLike