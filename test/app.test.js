const app = require('../src/app');
const fixtures = require('./bookmarks.fixture');
const knex = require('knex');


let db;
  
before('make knex instance', () => {
  db = knex({
    client: 'pg',
    connection: process.env.DB_URL_TEST
  });
  app.set('db', db);
});

after('disconnect from db', () => db.destroy());

before('cleanup', () => db('bookmarks').truncate());

afterEach('cleanup', () => db('bookmarks').truncate());

describe('handles GET correctly',() => {
  
  context('Given there are bookmarks in the database', () => {
    const testBookmarks = fixtures.bookmarksArray();
    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks);
    });

    it('returns all bookmarks',()=>{
      return request(app)
        .get('/api/bookmarks')
        .expect(200)
        .expect((res)=>{
          expect(res.body).is.an('array');
        });
    });
  });

  context('Given an XSS attack bookmark', () => {
    const { maliciousBookmark, expectedBookmark } = fixtures.maliciousBookmark();

    beforeEach('insert malicious bookmark', () => {
      return db
        .into('bookmarks')
        .insert([maliciousBookmark]);
    });

    it('removes XSS attack content', () => {
      return request(app)
        .get('/api/bookmarks')
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedBookmark.title);
          expect(res.body[0].description).to.eql(expectedBookmark.description);
        });
    });
  });

  context('Given no bookmarks', () => {
    it('responds with 200 and empty list', () => {
      return request(app)
        .get('/api/bookmarks')
        .expect(200, []);
    });
  });

  context('Given an XSS attack bookmark', () => {
    const { maliciousBookmark, expectedBookmark } = fixtures.maliciousBookmark();

    beforeEach('insert malicious bookmark', () => {
      return db
        .into('bookmarks')
        .insert([maliciousBookmark]);
    });

    it('removes XSS attack content', () => {
      return request(app)
        .get('/api/bookmarks')
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedBookmark.title);
          expect(res.body[0].description).to.eql(expectedBookmark.description);
        });
    });
  });
});

describe('GET /bookmarks/:id', () => {
  context('Given no bookmarks', () => {
    it('responds 404 when bookmark does not exist', () => {
      return request(app)
        .get('/api/bookmarks/123')
        .expect(404, {error: {message: 'Bookmark Not Found'}});
    });
  });

  context('Given bookmarks in database', () => {
    const testBookmarks = fixtures.bookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks);
    });
    it('returns specific book', ()=>{
      return request(app).get('/api/bookmarks/1')
        .expect(200)
        .expect((res)=>{
          expect(res.body).is.an('object');
        });
    });
    it('returns 404 if id is not in DB',()=>{
      return request(app).get('/api/bookmarks/402111')
        .expect(404);
    });
    it('responds with 200 and the specified bookmark', () => {
      const bookmarkId = 2;
      const expectedBookmark = testBookmarks[bookmarkId - 1];
      return request(app)
        .get(`/api/bookmarks/${bookmarkId}`)
        .expect(200, expectedBookmark);
    });
  });

  context('Given an XSS attack bookmark', () => {
    const { maliciousBookmark, expectedBookmark } = fixtures.maliciousBookmark();

    beforeEach('insert malicious bookmark', () => {
      return db
        .into('bookmarks')
        .insert([maliciousBookmark]);
    });

    it('removes XSS attack content', () => {
      return request(app)
        .get('/api/bookmarks')
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedBookmark.title);
          expect(res.body[0].description).to.eql(expectedBookmark.description);
        });
    });
  });
});

describe('Handles POST request',()=>{
  it('creates a bookmark, responding with 201 and the new bookmark', () => {
    const newBookmark = {
      title: 'Test new bookmark',
      url: 'http://google.com',
      description: 'Test description of the bookmark',
      rating: 2
    };
    return request(app)
      .post('/api/bookmarks')
      .send(newBookmark)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(newBookmark.title);
        expect(res.body.url).to.eql(newBookmark.url);
        expect(res.body.description).to.eql(newBookmark.description);
        expect(res.body.rating).to.eql(newBookmark.rating);
        expect(res.body).to.have.property('id');
      })
      .then(res => {
        return request(app)
          .get(`/api/bookmarks/${res.body.id}`)
          .expect(res.body);
      });
  });

  it('removes XSS attack content from response', () => {
    const { maliciousBookmark, expectedBookmark } = fixtures.maliciousBookmark();
    return request(app)
      .post('/api/bookmarks')
      .send(maliciousBookmark)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(expectedBookmark.title);
        expect(res.body.description).to.eql(expectedBookmark.description);
      });
  });
  
  const requiredFields = ['title', 'url', 'rating'];

  requiredFields.forEach(field => {
    const newBookmark = {
      title: 'Test new bookmark',
      url: 'http://google.com',
      rating: 2
    };

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newBookmark[field];
      return request(app)
        .post('/api/bookmarks')
        .send(newBookmark)
        .expect(400, {
          error: { message: `'${field}' is required` }
        });
    });
  });



  it('responds with a 400 if "rating" is not between 0 and 5',()=>{
    const invalidRating = {
      title: 'Test new bookmark',
      url: 'http://google.com',
      rating: 'invalid'
    };
    return request(app)
      .post('/api/bookmarks')
      .send(invalidRating)
      .expect(400, {error: {message: '"rating" must be a number between 0 and 5'}});
  });

  it('responds with a 400 if "url" is not valid',()=>{
    const invalidUrl = {
      title: 'Test new bookmark',
      url: 'htp:/google.com',
      rating: 2
    };
    return request(app)
      .post('/api/bookmarks')
      .send(invalidUrl)
      .expect(400, {error: {message: '"url" must be a valid URL'}});
  });

});

describe('DELETE /bookmarks/:id', () => {
  context('Given no bookmarks', () => {
    it('responds 404 when bookmark does not exist', () => {
      return request(app)
        .delete('/api/bookmarks/123')
        .expect(404, {error: {message: 'Bookmark Not Found'}});
    });
  });

  context('Given bookmarks in the database', () => {
    const testBookmarks = fixtures.bookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks);
    });

    it('removes the bookmark by ID from the store', () => {
      const idToRemove = 1;
      const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove);
      return request(app)
        .delete(`/api/bookmarks/${idToRemove}`)
        .expect(204)
        .then(() => {
          request(app)
            .get('/api/bookmarks')
            .expect(expectedBookmarks);
        });
    });
  });
});

describe.only('PATCH /api/bookmarks/:id', () => {
  context('Given no bookmarks', () => {
    it('responds with 404', () => {
      const bookmarkId = 123456;
      return request(app)
        .patch(`/api/bookmarks/${bookmarkId}`)
        .expect(404, { error: { message: 'Bookmark Not Found' }});
    });
  });
  
  context('Given there are bookmarks in the database', () => {
    const testBookmarks = fixtures.bookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks);
    });

    // failing test
    it('responds with 204 and updates the bookmark', () => {
      const idToUpdate = 2;
      const updateBookmark = {
        title: 'updated new bookmark',
        url: 'http://google.com',
        description: 'updated description',
        rating: 2
      };
      const expectedBookmark = {
        ...testBookmarks[idToUpdate - 1],
        ...updateBookmark
      };
      
      return request(app)
        .patch(`/api/bookmarks/${idToUpdate}`)
        .send(updateBookmark)
        .expect(204)
        .then(res => 
          request(app)
            .get(`/api/bookmarks/${idToUpdate}`)
            .expect(expectedBookmark)
          )
    });

    it('responds with 400 when no required fields supplied', () => {
      const idToUpdate = 2;
      return request(app)
        .patch(`/api/bookmarks/${idToUpdate}`)
        .send({ irrelevantField: 'foo'})
        .expect(400, { error: { Message: 'Request body must contain either "title", "url", "description" or "rating"' }});
    });

    it(`responds with 204 when updating only a subset of fields`, () => {
      const idToUpdate = 2;
      const updateBookmark = {
        title: 'updated bookmark title'
      };
      const expectedBookmark = {
        ...testBookmarks[idToUpdate - 1],
        ...updateBookmark
      };

      return request(app)
        .patch(`/api/bookmarks/${idToUpdate}`)
        .send({
          ...updateBookmark,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(204)
        .then(res =>
          request(app)
            .get(`/api/bookmarks/${idToUpdate}`)
            .expect(expectedBookmark)
        );
    });
  });
});