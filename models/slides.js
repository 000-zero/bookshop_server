const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Slides extends Model { }//创建一个类,继承Model
Slides.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  title: DataTypes.STRING,
  img: DataTypes.STRING,
  url: DataTypes.STRING,
  status: DataTypes.INTEGER,
  seq: DataTypes.INTEGER,
}, { sequelize, modelName: 'Slides',tableName: 'slides' })


module.exports = Slides