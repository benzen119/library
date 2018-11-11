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
},
{
  freezeTableName: true,
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
},
  {
    freezeTableName: true,
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
},
  {
    freezeTableName: true,
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
},
  {
    freezeTableName: true,
  })

Book.belongsTo(Edition, {
  foreignKey: 'edition_id',
  targetKey: 'editionId',
})

Edition.belongsTo(Publication, {
  foreignKey: 'publication_id',
  targetKey: 'publicationId',
})

Publication.belongsTo(Author, {
  foreignKey: 'author_id',
  targetKey: 'authorId',
})

function executeOneRelation() {
  var fs = require('fs')
  var fileText = ''
  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
      for (var i = 0; i < 20; i++) {
        var start = new Date().getTime()
        Book.findAll({
          attributes: ['inventory'],
          include: [{
            model: Edition,
            where: {
              isbn: '2323s'
            }
          }]
        }).then(result => {
          var end = new Date().getTime()
          var executionTime = end - start
          fileText += (executionTime / 1000) + "\n"
          if (i = 19) {
            fs.writeFile('../sequalize-times-20.txt', fileText, (err) => {
              if (err) throw err
            })
          }
        })
      }
      console.log('finished')
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err)
    })
}

function executeTwoRelations() {
  var fs = require('fs')
  var fileText = ''
  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
      for (var i = 0; i < 10; i++) {
        var start = new Date().getTime()
        Book.findAll({
          attributes: ['inventory'],
          include: [{
            model: Edition,
            include: [{
              model: Publication,
              where: {
                title: 'publikacja'
              }
            }]
          }]
        }).then(result => {
          var end = new Date().getTime()
          var executionTime = end - start
          fileText += (executionTime / 1000) + "\n"
          // if (i = 19) {
          //   fs.writeFile('../sequalize-2r-times-20.txt', fileText, (err) => {
          //     if (err) throw err
          //   })
          // }
        })
      }
      console.log('finished')
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err)
    })
}

function executeThreeRelations() {
  var fs = require('fs')
  var fileText = ''
  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
      for (var i = 0; i < 1; i++) {
        var start = new Date().getTime()
        Book.findAll({
          attributes: ['book_title'],
          include: [{
            model: Edition,
            include: [{
              model: Publication,
              include: [{
                model: Author,
                where: {
                  surname: 'Sienkiewicz'
                }
              }]
            }]
          }]
        }).then(result => {
          var end = new Date().getTime()
          var executionTime = end - start
          fileText += (executionTime / 1000) + "\n"
          // if (i = 99) {
          //   fs.writeFile('../sequalize-3r-times-100.txt', fileText, (err) => {
          //     if (err) throw err
          //   })
          // }
        })
      }
      console.log('finished')
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err)
    })
}

executeThreeRelations()
