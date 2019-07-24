const route = require('express').Router();
const bookmarksService = require('../service/bookmarks_service');

route.get('/', (req, res, next) => {
  bookmarksService.getAllBookmarks(req.app.get('db'))
    .then(bookmark => {
      res.status(200);
      res.json(bookmark);
    })
    .catch(err => {
      console.log(err);
      next();
    });
}); 

function validateId(id){
  return !isNaN(id);
}

route.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  console.log(id);
  if(validateId(id)){
    bookmarksService.getById(req.app.get('db'), id)
      .then(bookmark => {
        console.log('this is the resp from db:',bookmark);
        if(bookmark.length >= 1 ){
          res.status(200);
          res.json(bookmark);
        }else{
          res.status(404).json({error:'book not found'});
        }
      })
      .catch(next);
  } else {
    res.status(400);
    res.json({error:'invalid id'});
  }
});

module.exports = route;