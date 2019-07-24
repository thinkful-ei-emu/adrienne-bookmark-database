const app = require('../src/app');
//supertest is global variable called request
const testData = require('./bookmarks.fixture')();
const knex = require('knex');


describe('handles GET correctly',()=>{
 
  it('resonse with a 200 code',()=>{
    return request(app).get('/').expect(200);
  });
  it('returns all bookmarks',()=>{
    return request(app)
      .get('/bookmarks')
      .expect(200)
      .expect((res)=>{
        expect(res.body).is.an('array');
      });
  });
  it('returns specific book',()=>{
    return request(app).get('/bookmarks/1')
      .expect(200)
      .expect((res)=>{
        expect(res.body[0]).is.an('object');
      });
  });
  it('returns a 400 if given invalid id',()=>{
    return request(app).get('/bookmarks/asdasd')
      .expect(400)
      .expect({error:'invalid id'});
  });
});

/* describe('Handles POST request',()=>{
  it(' returns a 400 if input is invalid',()=>{
    return request(app).post('/bookmarks')
  });
}); */