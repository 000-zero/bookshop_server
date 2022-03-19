const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Categories extends Model { }//创建一个类,继承Model
Categories.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  pid: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  level: DataTypes.INTEGER,
  group: DataTypes.STRING,
}, { sequelize, modelName: 'Categories',tableName: 'categories' })


module.exports = Categories