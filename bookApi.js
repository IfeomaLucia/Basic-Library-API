//importing the necessary requirements from the node modules
var express = require('express');
var app = express();
var fs = require('fs');
var parser = require('body-parser');

var library = new Library("Global");

//Creating the server at port 3000
app.listen(3000, function(){
    console.log("Server is listening on 3000");
});

app.use(parser.json());

//Displaying the entire books in the library
app.get('/', function(request, response){
    response.send(library.getBooks());
});

//Enables the addition of books to the library
app.post('/api/addBook', function(request, response){
    let params = request.body;
    let book = new Book(params.title, params.author, params.year, Math.random());
    library.addBook(book);
    response.send(library.getBooks());
});

//Finding a book by its Id
app.get('/api/getBookById', function(request,response){
    let id = request.query.id;
    response.send(library.getBookById(id));
});


//Updating any book in the library by calling its Id
app.put('/api/updateBook', function(request, response){
    let id = request.query.id;
    let body = request.body;
    library.updateBook(id, new Book(body.title, body.author, body.year, id));
    response.send(library.getBooks());
});

//Deletes a book from the library by finding its Id
app.delete('/api/deleteBook', function(request, response){
    let id = request.query.id;
    response.send(library.deleteBook(id));
});

app.get('/api/getBookByParam', function(request, response){
    let param = request.query.value;
    response.send(library.getBooksByParam(param));
})

app.get('/api/borrowBook', function(request,response){
    let id = request.query.id;
    response.send(library.borrowBooks(id));
});

app.get('/api/returnBook', function(request,response){
    let id = request.query.id;
    response.send(library.returnBook(id));
});
//Creating the Book function
function Book(title, author, year, id){
    this.title = title;
    this.author = author;
    this.year = year;
    this.id = id;
}

function Library(name){
    this.name = name;
    this.books = [];
    this.borrowedBooks = [];
}

//Creating a library object which enables it to read from our json file
//i.e. our database
Library.prototype.getLibrary = function(){
    return JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
};

//Creating another object which enables us to add items to the json file
Library.prototype.updateLibrary = function(){
    return fs.writeFileSync('./data.json', JSON.stringify(this.books));
};

//Creating the object which adds new books to our library
Library.prototype.addBook = function(book){
    this.books = this.getBooks();
    this.books.push(book);
    this.updateLibrary();
};

//Creating the object which fetches the existing books in our library
Library.prototype.getBooks = function(){
    this.books = this.getLibrary();
    return this.books;
};

//Creating an object which loops through our library and finds an
//existing book by its Id
Library.prototype.getBookById = function(id){
    this.books = this.getLibrary();
    for(let i = 0; i < this.books.length; i++){
        if(this.books[i].id == id){
            return this.books[i];
        }
    }
    return `Book with id, ${id}, does not exist in our library.`;
};

//Another object which returns the index of the book in the library
//The search is acheived using the book's Id
Library.prototype.getBookIndex = function(id){
    this.books = this.getLibrary();
    for(let i = 0; i < this.books.length; i++){
        if(this.books[i].id == id){
            return i;
        }
    }
    return `Book with id, ${id}, does not exist in our library.`;
};

//Another object which deletes the required book from the libraray
//It does this by finding the book with the particular Id 
Library.prototype.deleteBook = function(id){
    let bookIndex = this.getBookIndex(id);
    var output = "You have deleted the book: '"+ this.books[bookIndex].title +   
                 "' written by " + this.books[bookIndex].author + ".";
    this.books.splice(bookIndex, 1);
    this.updateLibrary(this.books);
    return output;
};

//This object provides the function for updating books in the library
Library.prototype.updateBook = function(id, updatedBook){
    let bookIndex = this.getBookIndex(id);
    this.books[bookIndex] = updatedBook;
    console.log(this.books);
    this.updateLibrary(this.books);
    //OR
    // let currentBook = this.getBookById(id);
    // this.books = this.books.map(function(book) {
    //     return book.id === id ? this.updatedBook : book;
    // });
};

//This object gets the book searched for with any of the parameters, either title, year etc
Library.prototype.getBooksByParam = function(value){
    this.books = this.getLibrary();
    var books = [];
    for(let i = 0; i < this.books.length; i++){
        if(this.books[i].title == value || this.books[i].author == value
           || this.books[i].year == value || this.books[i].id == value){
            books.push(this.books[i]);
        }
    }
    return books;
};

Library.prototype.borrowBooks = function(id){
    var book =  this.getBookById(id);
    this.borrowedBooks.push(book);
    fs.writeFileSync('./borrowedBooks.json', JSON.stringify(this.borrowedBooks));
    //var output = `You just borrowed ${book.title} by ${book.author}.`
    this.deleteBook(id);
    return `You just borrowed ${book.title} by ${book.author}.`;
}

Library.prototype.returnBook = function(id){
    this.borrowedBooks = JSON.parse(fs.readFileSync('./borrowedBooks.json', 'utf-8'));
    for (let i = 0; i < this.borrowedBooks.length; i++){
        if(this.borrowedBooks[i].id == id){
            var book = this.borrowedBooks[i];
            var bookIndex = i;
        }
    }
    this.addBook(book);
    this.borrowedBooks.splice(bookIndex, 1);
    fs.writeFileSync('./borrowedBooks.json', JSON.stringify(this.borrowedBooks));
    //var message = `You just returned ${book.title} by ${book.author} (${book.year}).`;
    return `You just returned ${book.title} by ${book.author}`;
}