const app = require('../src/app');
//supertest is global variable called request
const testData = require('./bookmarks.fixture');

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
        expect(res.body).is.eql(testData);
      });
  });
  it('returns specific book',()=>{
    return request(app).get('/bookmarks/1')
      .expect(200)
      .expect((res)=>{
        expect(res.body).is.eql(testData[0]);
      });
  });
  it('returns a 404 if given invalid id',()=>{
    return request(app).get('/bookmarks/asdasd')
      .expect(404)
      .expect({error:'invalid id'});
  });
});
/* describe('Handles POST request',()=>{
  it(' returns a 400 if input is invalid',()=>{
    return request(app).post('/bookmarks')
  });
}); */