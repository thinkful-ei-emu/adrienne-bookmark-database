const bookmarksService = require('../service/bookmarks_service');
const express = require('express');
const jsonParser = express.json();
const logger = require('../logger');
const xss = require('xss');
const { isWebUri } = require('valid-url');
const bookmarksRouter = express.Router();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});

bookmarksRouter
  .route('/')

  .get((req, res, next) => {
    bookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmark => {
        res.json(bookmark.map(serializeBookmark));
      })
      .catch(next);
  }) 

  .post(jsonParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if(!req.body[field]) {
        logger.error(`'${field}' is required`);
        return res.status(400).send({ error: { message: `'${field}' is required` }});
      }
    }
    const { title, url, description, rating } = req.body;
    if(!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating of '${rating}`);
      return res.status(400).send({error: {message: '"rating" must be a number between 0 and 5'}});
    }
    if(!isWebUri(url)) {
      logger.error(`Invalid url of '${url}`);
      return res.status(400).json({error: {message: '"url" must be a valid URL'}});
    }
    const newBookmark = { title, url, description, rating };
    bookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        logger.info(`Card with id ${bookmark.id} created`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarksRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    function validateId(id){
      return !isNaN(id);
    }
    if(validateId(id)){
      bookmarksService.getById(req.app.get('db'), id)
        .then(bookmark => {
          if(!bookmark) {
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(404).json({
              error: {message: 'Bookmark Not Found'}
            });
          }
          res.bookmark = bookmark;
          next();
        })
        .catch(next);
    }
  })
  
  .get((req, res, next) => {
    res.status(200);
    res.json(res.bookmark);
  })

  .delete((req, res, next) => {
    const { id } = req.params;
    bookmarksService.deleteBookmark(
      req.app.get('db'),
      id
    )
      .then(numRowsAffected => {
        logger.info(`Card with id '${id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;