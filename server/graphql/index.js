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
const { City, Event_Venue_City, Event, Venue, Tag, Category } = require('../db/models');

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
    await Tag.destroy({ where: {}, truncate: true });
    await Category.destroy({ where: {}, truncate: true });

    const data = await fs.promises.readFile(filePath, 'utf-8');
    const xmlData = await parseStringPromise(data);
    const xmlDataArr = xmlData.subevents.subevent;

    const chunkSize = 300;
    const chunkedArray = xmlDataArr.slice(0, chunkSize);

    for (const el of xmlDataArr) {
      const cityRegion = el.region.join();
      const eventTitle = el.title.join();
      const eventDate = el.date.join();
      const venueName = el.venue.join();
      const venueDescription = el.description[0].replace(/<\/?p>/g, '');
      const venueAge = el.age.join();
      const venueUrl = el.url.join();
      const venueMin_price = el.min_price.join();
      const venueMax_price = el.max_price.join();
      const categoryName = el.category.join();
      const tagName = el.web_tag_groups.join();

      const [city] = await City.findOrCreate({
        where: { region: cityRegion },
        defaults: { region: cityRegion }
      });

      const [event] = await Event.findOrCreate({
        where: { title: eventTitle },
        defaults: { event: eventTitle, date: eventDate }
      });

      const [venue] = await Venue.findOrCreate({
        where: { venue: venueName },
        defaults: {
          venue: venueName,
          description: venueDescription,
          url: venueUrl,
          age: venueAge,
          min_price: venueMin_price,
          max_price: venueMax_price,
        }
      });


      await Event_Venue_City.findOrCreate({
        where: {
          event_id: event.id,
          venue_id: venue.id,
          city_id: city.id
        },
        defaults: {
          event_id: event.id,
          venue_id: venue.id,
          city_id: city.id
        }
      });

      await Category.create({
        event_id: event.id,
        category: categoryName,
      });

      await Tag.create({
        tag: tagName,
        event_id: event.id,
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
    region: { type: GraphQLNonNull(GraphQLString) }
  })
});

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    date: { type: GraphQLNonNull(DateScalar) },
    category: { type: GraphQLString },
    tag: { type: GraphQLString },
  })
});

const VenueType = new GraphQLObjectType({
  name: 'Venue',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    venue: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    url: { type: GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLNonNull(GraphQLString) },
    min_price: { type: GraphQLNonNull(GraphQLString) },
    max_price: { type: GraphQLNonNull(GraphQLString) },
    date: { type: GraphQLNonNull(DateScalar) },
  })
});

const CategoryType = new GraphQLObjectType({
  name: 'Category',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    category: { type: GraphQLNonNull(GraphQLString) },
  })
});

const TagType = new GraphQLObjectType({
  name: 'Tag',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    tag: { type: GraphQLNonNull(GraphQLString) },
  })
});


const getAllCitiesResolver = async () => {
  try {
    // await parseXMLFile('data/export.xml');
    const cities = await City.findAll();
    return cities;
  } catch (e) {
    console.log('Ошибка при получении списка городов', e.message);
  }
};



const getEventsByCityResolver = async (parent, { cityId, category, tag }) => {
  try {
    const eventVenueCityRecords = await Event_Venue_City.findAll({
      where: { city_id: cityId },
      include: { model: Event }
    });

    const events = eventVenueCityRecords.map(({ Event }) => Event);

    const eventsWithCategoryTag = await Promise.all(events.map(async (event) => {
      const categoryData = await Category.findOne({ where: { event_id: event.id } });
      const tagData = await Tag.findOne({ where: { event_id: event.id } });

      return {
        ...event.dataValues,
        category: categoryData ? categoryData.category : null,
        tag: tagData ? tagData.tag : null,
      };
    }));

    return eventsWithCategoryTag.filter((event) => {
      if (category && event.category !== category) return false;
      if (tag && event.tag !== tag) return false;
      return true;
    });
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
    const venue = eventVenueCityRecord.Venue.dataValues;
    const eventDate = eventVenueCityRecord.Event.date;

    return [{
      ...venue,
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
        cityId: { type: GraphQLNonNull(GraphQLInt) },
        category: { type: GraphQLString },
        tag: { type: GraphQLString },
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


