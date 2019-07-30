const app = require('express')();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const bookmarksRoute = require('./bookmarks/bookmarksRouter');
const {NODE_ENV} = require('./config');

app.use(helmet());
app.use(cors());
app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}));

app.use('/api/bookmarks', bookmarksRoute);

app.use((err, req, res, next)=>{
  let response;
  console.error(err);
  if(NODE_ENV === 'production'){

    response = {error:{message:'Critical Server Error'}};
  }else{
    response = {error:{message:err.message,err}};
  }
  res.status(500).json(response);
});
module.exports = app;