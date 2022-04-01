const express = require("express");
const router = express.Router();
const Book = require("../models/books");
const Category = require("../models/categories");
const Author = require("../models/authors");
const { route } = require(".");
// handled  this Route here  : books/new
router.get("/new/", (req, res) => {
  res.render("bookform");
});
// handled  this Route here  : books/ post request once  the user submit  the data .
// data is stored in the database\
router.post("/", (req, res) => {
  let categoryData = {};
  let authorData = {};
  let bookData = {};
  categoryData.name = req.body.category;
  authorData.name = req.body.author;
  bookData.title = req.body.title;
  bookData.summary = req.body.summary;
  bookData.pages = req.body.pages;
  bookData.publication = req.body.publication;
  //Book Data is here
  Book.create(bookData, (err, book) => {
    Category.create(categoryData, (err, category, next) => {
      console.log(category);
      Category.findByIdAndUpdate(
        category._id,
        { $push: { books: book._id } },
        { new: true },
        (err, category) => {
          // now updating the book data and adding the category document
          // id  book category field
          Book.findByIdAndUpdate(
            book._id,
            { $push: { category: category._id } },
            { new: true },
            (err, updatedBook) => {
              if (err) return next(err);
            }
          );
        }
      );
    });
    // here adding name of the author coming form  the form data then updating
    // the author data with adding  the book id to  the author so then it will
    // make a many to many relationship with the book document
    Author.create(authorData, (err, bookauthor, next) => {
      console.log(bookauthor._id);
      console.log("earlier book id is  :" + bookauthor.bookId);
      Author.findByIdAndUpdate(
        bookauthor._id,
        { $push: { bookId: book._id } },
        { new: true },
        (err, updatedAuthor) => {
          // now updating the book data and adding the author document
          // id  in the book author field
          Book.findByIdAndUpdate(
            book._id,
            { $push: { author: updatedAuthor._id } },
            { new: true },
            (err, updatedBook) => {
              if (err) return next(err);
            }
          );
        }
      );
    });
  });
  res.render("index");
});

// handle the route here  to show all the books
router.get("/", (req, res) => {
  Book.find({}, (err, books) => {
    res.render("allbooks", { books: books });
  });
});

//Get the complete book detail by using a single book id
//once the user click on the readmore button we are going to handle
// this Route : /books/:id
router.get("/:id", (req, res) => {
  let id = req.params.id;
  //   res.send('this is the id of the Book :'+id);
  Book.findById(id)
    .populate("category")
    .populate("author")
    .exec((err, book) => {
      //   console.log(book);
      book.category.forEach((c) => {
        console.log(c.name);
      });
      res.render("singlebook", { book: book });
    });
});

// now handle and filter by the name and get the articles
// handled this route here : books/categoryname/category/
router.get("/:categoryname/category/", (req, res) => {
  let categoryname = req.params.categoryname;
  //   res.send('this is the id of the Book :'+id);
  Category.find({ name: categoryname })
    .populate("books")
    .exec((err, categoryData) => {
      console.log(categoryData);
      res.render("bookbycategory", { category: categoryData });
    });
});

module.exports = router;
