const app = require('./app');
const {PORT, DB_URL, DB_URL_TEST} = require('./config');
const knex = require('knex');

console.log(DB_URL_TEST);
const db = knex({
  client: 'pg',
  connection: DB_URL_TEST,
});

app.set('db', db);

app.listen(PORT,()=>{
  console.log(`Server is listening on port ${PORT}`);
});

