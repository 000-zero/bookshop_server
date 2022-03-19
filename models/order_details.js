const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Order_details extends Model { }//创建一个类,继承Model
Order_details.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  order_id: DataTypes.INTEGER,
  goods_id: DataTypes.INTEGER,
  price: DataTypes.INTEGER,
  num: DataTypes.INTEGER,
}, { sequelize, modelName: 'Order_details',tableName: 'order_details' })


module.exports = Order_details