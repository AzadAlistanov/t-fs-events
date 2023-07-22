'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    static associate({ City, Event, Event_Venue_City }) {
      this.belongsToMany(City, { through: Event_Venue_City, foreignKey: 'venue_id' });
      this.belongsToMany(Event, { through: Event_Venue_City, foreignKey: 'venue_id' });
    }
  }
  Venue.init({
    venue: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};