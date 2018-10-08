var caminte = require('caminte')
var Schema = caminte.Schema

var config = {
  driver: "postgres",
  host: "localhost",
  port: "8000",
  username: "postgres",
  password: "123",
  database: "caminte",
  pool: true,
}

var schema = new Schema(config.driver, config)

var Author = schema.define('author', {
  authorId: { type: schema.Number },
  name: { type: schema.String },
  surname: { type: schema.String }
}, {
    primaryKeys: ['authorId']
})

var Publication = schema.define('publication', {
  publicationId: { type: schema.Number },
  title: { type: schema.String, unique: true },
  authorId: { type: schema.Number }
}, {
    primaryKeys: ["publicationId"]
  })

var Edition = schema.define('edition', {
  editionId: { type: schema.Number },
  isnb: { type: schema.String },
  publicationId: { type: schema.Number }
}, {
    primaryKeys: ["editionId"]
  })

var Book = schema.define('book', {
  bookId: { type: schema.Number },
  inventory: { type: schema.Number },
  bookTitle: { type: schema.String },
  editionId: { type: schema.Number }
}, {
    primaryKeys: ["bookId"]
  })

Author.hasMany(Publication, { as: 'publications', foreignKey: 'authorId' })
Publication.belongsTo(Author, { as: 'author', foreignKey: 'authorId' })
Publication.hasMany(Edition, { as: 'editions', foreignKey: 'publicationId' })
Edition.hasMany(Book, { as: 'books', foreignKey: 'editionId' })
Edition.belongsTo(Publication, { as: 'publication', foreignKey: 'publicationId' })
Book.belongsTo(Edition, { as: 'publication', foreignKey: 'editionId' })

Author.create({
  authorId: 1,
  name: 'Adam',
  surname: 'Mickiewicz',
})