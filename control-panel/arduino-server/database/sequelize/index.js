const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');
require('dotenv').config();

console.log("DB_CONNECTION_URL:", process.env.DB_CONNECTION_URL);

const sequelize = new Sequelize(process.env.DB_CONNECTION_URL, {
    logQueryParameters: true,
    benchmark: true
});

const modelDefiners = [
	require('./models/user'),
	require('./models/event'),
	require('./models/classroom'),
];

for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

applyExtraSetup(sequelize);

module.exports = sequelize;