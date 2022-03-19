const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Student extends Model { }//创建一个类,继承Model
Student.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  age: DataTypes.INTEGER,
  score: DataTypes.FLOAT,
  brithday: DataTypes.DATE,
}, { sequelize, modelName: 'Student',tableName: 'student' })

module.exports = Student