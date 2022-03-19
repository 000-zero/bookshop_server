const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Goods extends Model { }//创建一个类,继承Model
Goods.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  category_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  price: DataTypes.INTEGER,
  stock: DataTypes.INTEGER,
  cover: DataTypes.STRING,
  pics: DataTypes.JSON,
  details: DataTypes.TEXT,
  sales: DataTypes.INTEGER,
  is_on: DataTypes.INTEGER,
  is_recommend: DataTypes.INTEGER,
}, { sequelize, modelName: 'Goods',tableName: 'goods' })


module.exports = Goods