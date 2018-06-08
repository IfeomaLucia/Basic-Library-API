var express = require('express');
var app = express();
var fs = require('fs');

var library = new Library("Global");
app.listen(3000, function(){
    console.log("Server is listening on 3000");
});

app.get('/', function(request, response){
    response.send(library.getBooks());
});

app.post('/api/book', function(request, response){
    let params = request.query;
    let book = new Book(params.title, params.author, params.year, Math.random());
    Library.addBook(book);
    response.send(Library.getBooks());
});

function Book(title, author, year, id){
    this.title = title;
    this.author = author;
    this.year = year;
    this.id = id;
}

function Library(name){
    this.name = name;
    //this.books = fs.readFileSync('./data.json', 'utf-8');
    this.books = [];
}

Library.prototype.getLibrary = function(){
    return JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
};

Library.prototype.updateLibrary = function(books){
    return fs.writeFileSync('./data.json', JSON.stringify(this.books));
};

Library.prototype.addBook = function(book){
    this.books.push(book);
    this.updateLibrary(this.books);
};

Library.prototype.getBooks = function(){
    this.books = this.getLibrary();
    return this.books
};

Library.prototype.getBookById = function(id){
    this.books = this.getLibrary();
    for(var i = 0; i < this.books.length; i++){
        if(this.books[i].id === id){
            return {
                book: this.books[i],
                index: i
            };
        }
    }
};

Library.prototype.getBookIndex = function(id){
    this.books = this.getLibrary();
    for(var i = 0; i < this.books.length; i++){
        if(this.books[i].id === id){
            return i;
        }
    }
};

Library.prototype.deleteBook = function(id){
    let bookIndex = this.getBookByIndex(id);
    this.books.splice(bookIndex, 1);
    this.updateLibrary(this.books);
};

Library.prototype.updateBook = function(id, updatedBook){
    let bookIndex = this.getBookIndex(id);
    this.books[bookIndex] = updatedBook;
    this.updateLibrary(this.books);
    //OR
    // let currentBook = this.getBookById(id);
    // this.books = this.books.map(function(book) {
    //     return book.id === id ? this.updatedBook : book;
    // });
};

Library.prototype.getBooksByParam = function(param, value){
    let books = this.getLibrary;
    for(let i = 0; i < this.books.length; i++){
        if(this.books[i][param] == value){
            books.push(this.books[i]);
        }
    }
    return books;
};

//var Book1 = new Book("Along came a spider", "James Patterson", 1995, 1);


