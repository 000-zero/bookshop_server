const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Users extends Model { }//创建一个类,继承Model
Users.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  phone: DataTypes.STRING,
  acatar: DataTypes.STRING,
  is_locked: DataTypes.INTEGER,
  password_verified: DataTypes.DATE,
  remember_token: DataTypes.STRING,
  Role:DataTypes.STRING
}, { sequelize, modelName: 'Users',tableName: 'users' })


module.exports = Users