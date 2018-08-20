const pg = require('pg')

const pool = new pg.Pool({
  database: 'library',
  user: 'postgres',
  password: '123',
  port: 8000,
})

pool.connect().then(client => {
  client.query()
}).catch((err) => console.log(err))

