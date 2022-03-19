const { sequelize } = require("../db/index")
const { DataTypes, Model } = require("sequelize")

class Cart extends Model { }//创建一个类,继承Model
Cart.init({
  id: { type:DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  goods_id: DataTypes.INTEGER,
  num: DataTypes.INTEGER,
  is_checked: DataTypes.INTEGER,
}, { sequelize, modelName: 'Cart',tableName: 'cart' })


module.exports = Cart