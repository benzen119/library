const caminte = require('caminte')
const Schema = caminte.Schema
const schema = new Schema('postgres', { port: 8000 })

const Author = schema.define('author', {
  authorId: { type: schema.Number },
  name: { type: schema.String },
  surname: { type: schema.String }
}, {
    primaryKeys: ["authorId"]
})

Author.hasMany(Publication, { as: 'publications', foreignKey: 'authorId' })

const Publication = schema.define('publication', {
  publicationId: { type: schema.Number },
  title: { type: schema.String, unique: true },
  authorId: { type: schema.Number }
}, {
    primaryKeys: ["publicationId"]
  })

Publication.belongsTo(Author, { as: 'author', foreignKey: 'authorId' })
Publication.hasMany(Edition, { as: 'editions', foreignKey: 'publicationId' })

const Edition = schema.define('edition', {
  editionId: { type: schema.Number },
  isnb: { type: schema.String },
  publicationId: { type: schema.Number }
}, {
    primaryKeys: ["editionId"]
  })

Edition.hasMany(Book, { as: 'books', foreignKey: 'editionId' })
Edition.belongsTo(Publication, { as: 'publication', foreignKey: 'publicationId' })

const Book = schema.define('book', {
  bookId: { type: schema.Number },
  inventory: { type: schema.Number },
  bookTitle: { type: schema.String },
  editionId: { type: schema.Number }
}, {
    primaryKeys: ["bookId"]
  })

Book.belongsTo(Edition, { as: 'publication', foreignKey: 'editionId' })