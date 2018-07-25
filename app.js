const express = require('express')
const pg = require('pg')
const app = express()

const pool = new pg.Pool({
  database: 'library',
  user: 'postgres',
  password: '123',
  port: 8000,
})

pool.connect(onConnect)

function onConnect(err, client, done) {
  //Err - This means something went wrong connecting to the database.
  if (err) {
    console.error('Error occured', err)
    process.exit(1)
  }
  //For now let's end client
  console.log('success')
  client.query('SELECT * FROM users').then(data => {
    console.log(data)
  })
}

app.listen(4000, function () {
  console.log('Server is running.. on Port 4000')
})