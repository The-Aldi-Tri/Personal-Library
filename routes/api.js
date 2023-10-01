/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    comments: [String]
  }
)
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema)

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res) {
      // response will be array of book objects
      // json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let books = await Book.find({}, { __v: 0 })
      books = books.map((book) => {
        return {
          title: book.title,
          _id: book._id,
          commentcount: book.comments.length
        }
      })
      return res.json(books)
    })

    .post(async function (req, res) {
      const title = req.body.title
      // response will contain new book object including atleast _id and title
      if (!title) return res.send('missing required field title')

      const newBook = new Book({ title })
      await newBook.save().then((savedDoc) => {
        const obj = {
          title: savedDoc.title,
          _id: savedDoc._id
        }
        return res.json(obj)
      })
    })

    .delete(async function (req, res) {
      // if successful response will be 'complete delete successful'
      const deleteAll = await Book.deleteMany({})
      if (deleteAll.deletedCount >= 1) {
        return res.send('complete delete successful')
      }
    })

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id || req.body.id
      // json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = await Book.findOne({ _id: bookid }, { __v: 0 })
      if (book) {
        return res.json(book)
      } else {
        return res.send('no book exists')
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id
      const comment = req.body.comment
      // json res format same as .get
      if (!comment) return res.send('missing required field comment')

      const found = await Book.findOne({ _id: bookid })
      if (!found) return res.send('no book exists')

      const updated = await Book.findOneAndUpdate(
        { _id: bookid },
        { $push: { comments: comment } },
        { returnDocument: 'after' }
      )
      const obj = {
        _id: updated._id,
        title: updated.title,
        comments: updated.comments
      }
      return res.json(obj)
    })

    .delete(async function (req, res) {
      const bookid = req.params.id
      // if successful response will be 'delete successful'
      const deleted = await Book.deleteOne({ _id: bookid })
      if (deleted.deletedCount === 1) {
        return res.send('delete successful')
      } else {
        return res.send('no book exists')
      }
    })
}
