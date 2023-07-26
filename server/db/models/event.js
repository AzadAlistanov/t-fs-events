'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate({ Venue, Event_Venue_City, City, Category, Tag, }) {
      this.belongsToMany(Venue, { through: Event_Venue_City, foreignKey: 'event_id' });
      this.belongsToMany(City, { through: Event_Venue_City, foreignKey: 'event_id' });

      this.hasMany(Category, { foreignKey: 'event_id' });
      this.hasMany(Tag, { foreignKey: 'event_id' });
    }
  }
  Event.init({
    title: DataTypes.STRING,
    date: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};