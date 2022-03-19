'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_name: DataTypes.STRING,
    user_password: DataTypes.STRING,
    user_gender: DataTypes.INTEGER,
  
    user_tel: DataTypes.STRING,
    user_age: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  User.sync({ force: true })

  return User;
  module.exports = user
};

