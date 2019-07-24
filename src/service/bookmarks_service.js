const bookmarksService = {
  getAllBookmarks(db) {
    return db.select('*').from('bookmarks');
  },
  getById(db, id) {
    return db.select('*').from('bookmarks').where({id});
  }
};

module.exports = bookmarksService;