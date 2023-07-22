const { sequelize } = require('./models');


async function connect() {
  try {
    await sequelize.authenticate();
    console.log('Connected!');
  } catch (e) {
    console.error('No connected', e.message);
  }
}

module.exports = { connect };