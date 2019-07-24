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

route.get('/:id', (req, res, next) => {
  bookmarksService.getById(req.app.get('db'), req.params.id)
    .then(bookmark => {
      res.status(200);
      res.json(bookmark);
    })
    .catch(next);
});

module.exports = route;