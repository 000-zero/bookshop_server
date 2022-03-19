const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Address extends Model { }//创建一个类,继承Model
Address.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  name: DataTypes.STRING,
  province: DataTypes.STRING,
  city: DataTypes.STRING,
  county: DataTypes.STRING,
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  is_default:DataTypes.INTEGER
}, { sequelize, modelName: 'Address',tableName: 'address' })


module.exports = Address