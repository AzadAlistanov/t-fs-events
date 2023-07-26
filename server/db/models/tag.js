'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {

    static associate({ Event }) {
      this.belongsTo(Event, { foreignKey: 'event_id' });
    }
  }

  Tag.init({
    tag: DataTypes.STRING,
    event_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Tag',
  });

  return Tag;
};