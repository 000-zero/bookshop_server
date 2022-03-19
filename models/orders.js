const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Orders extends Model { }//创建一个类,继承Model
Orders.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  order_no: DataTypes.STRING,
  amount: DataTypes.INTEGER,
  address_id: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  express_type: DataTypes.STRING,
  express_no: DataTypes.STRING,
  pay_time: DataTypes.STRING,
  pay_type: DataTypes.STRING,
  trade_no: DataTypes.STRING,
}, { sequelize, modelName: 'Orders',tableName: 'orders' })


module.exports = Orders