/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const mocha = require('mocha')
const { suite, test } = mocha
const server = require('../server')
const mongoose = require('mongoose')
const { ObjectId } = require('mongoose').Types

chai.use(chaiHttp)

suite('Functional Tests', function () {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {
    let validId
    const invalidId = new ObjectId()

    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({ title: 'Some book title' })
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.body.title, 'Some book title')
            assert.isTrue(mongoose.isValidObjectId(res.body._id))
            validId = res.body._id
            done()
          })
      })

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing required field title')
            done()
          })
      })
    })

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            if (res.body.length >= 1) {
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
              assert.property(res.body[0], 'title', 'Books in array should contain title')
              assert.property(res.body[0], '_id', 'Books in array should contain _id')
            }
            done()
          })
      })
    })

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .keepOpen()
          .get('/api/books/' + invalidId)
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      })

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .keepOpen()
          .get('/api/books/' + validId)
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments', 'Books should contain comments')
            assert.property(res.body, 'title', 'Books should contain title')
            assert.property(res.body, '_id', 'Books should contain _id')
            done()
          })
      })
    })

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + validId)
          .send({ comment: 'this is new comment' })
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments', 'Books should contain comments')
            assert.property(res.body, 'title', 'Books should contain title')
            assert.property(res.body, '_id', 'Books should contain _id')
            assert.equal(res.body.comments[res.body.comments.length - 1], 'this is new comment')
            done()
          })
      })

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + validId)
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing required field comment')
            done()
          })
      })

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books/' + invalidId)
          .send({ comment: 'this is new comment' })
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      })
    })

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .keepOpen()
          .delete('/api/books/' + validId)
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'delete successful')
            done()
          })
      })

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai.request(server)
          .keepOpen()
          .delete('/api/books/' + invalidId)
          .end((err, res) => {
            if (err) assert.fail()
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      })
    })
  })
})
