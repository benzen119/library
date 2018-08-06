var Sequelize = require('sequelize')
const express = require('express')
const pg = require('pg')
const app = express()

const sequelize = new Sequelize('library', 'postgres', '123', {
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

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

app.listen(4000, function () {
  console.log('Server is running.. on Port 4000')
})