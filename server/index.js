require('dotenv').config();
const path = require('path');
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require('express-graphql');
const { connect } = require('./db');
const { schema } = require("./graphql");

const APP_PORT = process.env.APP_PORT || 5001;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

const serverStart = async () => {
  try {
    await connect();
    app.listen(APP_PORT, () => console.log(`Сервер запущен, http://localhost:${APP_PORT}`));
  }
  catch (e) {
    console.log('Сервер не запущен..', e.message);
  }
}
serverStart();