require('dotenv').config();

module.exports = {
  'migrationDirectory': 'migrations',
  'driver': 'pg',
  'username': process.env.MIGRATION_DB_USER,
  'password': process.env.MIGRATION_DB_PASS,
  'database': process.env.NODE_ENV === 'production' ? process.env.MIGRATION_DB_NAME : process.env.MIGRATION_DB_NAME_TEST
};