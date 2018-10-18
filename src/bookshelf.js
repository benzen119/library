const knex = require('knex')({
  client: 'postgres',
  connection: {
    host: 'localhost',
    port: 8000,
    user: 'postgres',
    password: '123',
    database: 'bookshelf',
    charset: 'utf8'
  },
})

// knex.select('inventory').from('book')
// .leftJoin('edition', 'book.edition_id', '=' , 'edition.edition_id')
// .where('isbn', '2323s')
// .then(function (data) {
//   console.log(data)
// })

// knex.select('inventory').from('book')
// .leftJoin('edition', 'book.edition_id', '=' , 'edition.edition_id')
// .leftJoin('publication', 'publication.publication_id', '=', 'edition.publication_id')
// .where('title', 'publikacja')
// .then(function (data) {
//   console.log(data)
// })

knex.select('book_title').from('book')
  .leftJoin('edition', 'book.edition_id', '=', 'edition.edition_id')
  .leftJoin('publication', 'publication.publication_id', '=', 'edition.publication_id')
  .leftJoin('author', 'author.author_id', '=', 'publication.author_id')
  .where('surname', 'Mickiewicz')
  .then(function (data) {
    console.log(data)
  })

const bookshelf = require('bookshelf')(knex)

const Author = bookshelf.Model.extend({
  tableName: 'author',
})

const Publication = bookshelf.Model.extend({
  tableName: 'book',
  author: function () {
    return this.belongsTo(Author)
  }
})

const Edition = bookshelf.Model.extend({
  tableName: 'book',
  publication: function () {
    return this.belongsTo(Publication)
  }
})

const Book = bookshelf.Model.extend({
  tableName: 'book',
  edition: function () {
    return this.belongsTo(Edition)
  }
})
