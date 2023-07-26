'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate({ Venue, Event, Event_Venue_City }) {
      this.belongsToMany(Venue, { through: Event_Venue_City, foreignKey: 'city_id' });
      this.belongsToMany(Event, { through: Event_Venue_City, foreignKey: 'city_id' });
    }
  }
  City.init({
    region: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'City',
  });
  return City;
};