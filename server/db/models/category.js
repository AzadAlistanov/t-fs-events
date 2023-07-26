'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate({ Event }) {
      this.belongsTo(Event, { foreignKey: 'event_id' });
    }
  }

  Category.init({
    category: DataTypes.STRING,
    event_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Category',
  });

  return Category;
};