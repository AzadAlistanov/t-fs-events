'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate({ Venue, Event_Venue_City, City }) {
      this.belongsToMany(Venue, { through: Event_Venue_City, foreignKey: 'event_id' });
      this.belongsToMany(City, { through: Event_Venue_City, foreignKey: 'event_id' });

    }
  }
  Event.init({
    event: DataTypes.STRING,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};