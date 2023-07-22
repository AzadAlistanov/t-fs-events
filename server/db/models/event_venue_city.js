'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event_Venue_City extends Model {
    static associate({ City, Event, Venue }) {
      this.belongsTo(City, { foreignKey: 'city_id' });
      this.belongsTo(Event, { foreignKey: 'event_id' });
      this.belongsTo(Venue, { foreignKey: 'venue_id' });
    }
  }
  Event_Venue_City.init({
    venue_id: DataTypes.INTEGER,
    city_id: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Event_Venue_City',
  });
  return Event_Venue_City;
};