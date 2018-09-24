var Sequelize = require('sequelize')
const express = require('express')
const pg = require('pg')
const app = express()

const sequelize = new Sequelize('postgres', 'postgres', '123', {
  host: 'localhost',
  port: 8000,
  dialect: 'postgres',
  pool: {
    max: 9,
    min: 0,
    idle: 10000
  },
  operatorsAliases: false
})

const Author = sequelize.define('author', {
  authorId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'author_id',
  },
  name: {
    type: Sequelize.STRING,
    field: 'name',
  },
  surname: {
    type: Sequelize.STRING,
    field: 'surname',
  },
})

const Publication = sequelize.define('publication', {
  publicationId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'publication_id',
  },
  title: {
    type: Sequelize.STRING,
    field: 'name',
    unique: true,
  },
  authorId: {
    type: Sequelize.INTEGER,
    field: 'author_id',
    references: {
      model: Author,
      key: 'author_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
})

const Edition = sequelize.define('edition', {
  editionId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'edition_id',
  },
  publicationId: {
    type: Sequelize.INTEGER,
    field: 'publication_id',
    references: {
      model: Publication,
      key: 'publication_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  isbn: {
    type: Sequelize.STRING,
    field: 'isbn',
  },
})

const Book = sequelize.define('book', {
  bookId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'book_id',
  },
  editionId: {
    type: Sequelize.INTEGER,
    field: 'edition_id',
    references: {
      model: Edition,
      key: 'edition_id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  bookTitle: {
    type: Sequelize.STRING,
    field: 'book_title',
  },
  inventory: {
    type: Sequelize.INTEGER,
    field: 'inventory'
  },
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
    Author.sync().then(() => {
      return Author.create({
        authorId: 1,
        name: 'Adam',
        surname: 'Mickiewicz',
      })
    })
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

// app.listen(4000, function () {
//   console.log('Server is running.. on Port 4000')
// })