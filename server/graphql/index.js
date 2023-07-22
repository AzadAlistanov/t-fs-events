const fs = require('fs');
const { parseStringPromise } = require('xml2js');
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLScalarType } = require('graphql');
const { City, Event_Venue_City, Event, Venue } = require('../db/models');

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

async function parseXMLFile(filePath) {
  try {
    await City.destroy({ where: {}, truncate: true });
    await Event.destroy({ where: {}, truncate: true });
    await Venue.destroy({ where: {}, truncate: true });
    await Event_Venue_City.destroy({ where: {}, truncate: true });

    const data = await fs.promises.readFile(filePath, 'utf-8');
    const xmlData = await parseStringPromise(data);
    const xmlDataArr = xmlData.data.events;

    for (const el of xmlDataArr) {
      const cityName = el.city.join();
      const eventName = el.event.join();
      const venueName = el.venue.join();
      const eventDate = new Date(el.date.join());

      const [city] = await City.findOrCreate({
        where: { city: cityName },
        defaults: { city: cityName }
      });

      const [event] = await Event.findOrCreate({
        where: { event: eventName },
        defaults: { event: eventName, date: eventDate }
      });

      const [venue] = await Venue.findOrCreate({
        where: { venue: venueName },
        defaults: { venue: venueName }
      });

      await Event_Venue_City.create({
        event_id: event.id,
        venue_id: venue.id,
        city_id: city.id
      });
    }
  } catch (e) {
    console.error('Ошибка при разборе XML-файла:', e.message);
  }
};

const CityType = new GraphQLObjectType({
  name: 'City',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    city: { type: GraphQLNonNull(GraphQLString) }
  })
});

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    event: { type: GraphQLNonNull(GraphQLString) },
    date: { type: GraphQLNonNull(DateScalar) },
  })
});

const VenueType = new GraphQLObjectType({
  name: 'Venue',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    venue: { type: GraphQLNonNull(GraphQLString) },
    date: { type: GraphQLNonNull(DateScalar) },
  })
});


const getAllCitiesResolver = async () => {
  try {
    await parseXMLFile('data/events-data.xml');
    const cities = await City.findAll();
    return cities;
  } catch (e) {
    console.log('Ошибка при получении списка городов', e.message);
  }
};

const getEventsByCityResolver = async (parent, { cityId }) => {
  try {

    const eventVenueCityRecords = await Event_Venue_City.findAll({
      where: { city_id: cityId },
      include: { model: Event }
    });
    const events = eventVenueCityRecords.map(({ Event }) => Event);
    return events;
  } catch (e) {
    console.log('Ошибка при получении списка событий по id города:', e.message);
  }
};

const getVenueByEventResolver = async (parent, { eventId }) => {
  try {
    const eventVenueCityRecord = await Event_Venue_City.findOne({
      where: { event_id: eventId },
      include: [
        { model: Venue },
        { model: Event }
      ]
    });
    const venue = eventVenueCityRecord.Venue.dataValues.venue;
    const eventDate = eventVenueCityRecord.Event.date;

    return [{
      id: eventVenueCityRecord.Venue.dataValues.id,
      venue,
      date: eventDate,
    }];

  } catch (e) {
    console.log('Ошибка при получении списка событий по id события:', e.message);
  }
};

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getAllCities: {
      type: GraphQLList(CityType),
      resolve: getAllCitiesResolver
    },
    getEventsByCity: {
      type: GraphQLList(EventType),
      args: {
        cityId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: getEventsByCityResolver,
    },
    getVenueByEvent: {
      type: GraphQLList(VenueType),
      args: {
        eventId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: getVenueByEventResolver,
    },
  }
});

exports.schema = new GraphQLSchema({
  query: RootQueryType
});


