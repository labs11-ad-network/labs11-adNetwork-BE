const knex = require("knex");
const knexConfig = require("../knexfile");
const environment = process.env.ENVIRONMENT || "production";
const db = knex(knexConfig[environment]);

module.exports = db;
