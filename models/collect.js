const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Collect extends Model { }//创建一个类,继承Model
Collect.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  goods_id: DataTypes.INTEGER,
  is_collect: DataTypes.INTEGER,
}, { sequelize, modelName: 'Collect',tableName: 'collect' })


module.exports = Collect