module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://admin@localhost/bookmarks',
  DB_URL_TEST: process.env.DB_URL_TEST || 'postgresql://admin@localhost/bookmarks_test'
};