
function readFile(fileName) {
  var fs = require('fs'),
  data = fs.readFileSync(fileName, 'utf-8');
  return data;
}

function objectifyModel(fileName) {

  var data = readFile(fileName);
  data = data.toString().split('\n');

  var entity = parse(data);
  var collection = determineType(entity);
  console.log(collection)
  return collection;
}

function parse(data) {
  var model = [];
  var modelCollection = [];

  for (var i = 0; i < data.length; i++) {
    data[i] = data[i].trim().split(/\s+/);
    if (data[i].toString().charAt(0) !== '') model.push(data[i]);
    else {
      modelCollection.push(model);
      model = [];
    }
  }
  return modelCollection
}

function determineType(entity) {
  var tables = [];
  var types = [];
  var set = [];

  for (var i = 0; i < entity.length; i++) {
    if (entity[i][0] == "@Types") types = createTypeObject(entity[i], types);
    else if (entity[i][0].toString().charAt(0) == "#") set.push(createSetObject(entity[i], types));
    else tables.push(createEntityObject(entity[i], types));
  }

  var collection = { tables: tables, types: types, set: set }

  return collection;
}

function resolveType(obj, types) {
  for (var i = 0; i < obj.param.length; i++) {
    for (var j = 0; j < obj.param[i].fieldType.length; j++) {
      for (var k = 0; k < types.length; k++) {
        if (obj.param[i].fieldType[j] == types[k].fieldName) {
          obj.param[i].fieldType.splice(j, 1);
          for (var l = 0; l < types[k].fieldType.length; l++)
            obj.param[i].fieldType.splice(j + l, 0, types[k].fieldType[l]);
        }
      }
    }
  }
  return obj;
}

function createTypeObject(entityParameters, types) {
  for (var i = 1; i < entityParameters.length; i++)
    types.push(prepareObject(entityParameters, i, "type"));

  return types;
}

function createSetObject(entityParameters, types) {
  var obj = { name: entityParameters[0][0].substr(1), param: [] };
  for (var i = 1; i < entityParameters.length; i++) obj.param.push(prepareObject(entityParameters, i, "set"));

  obj = resolveType(obj, types);
  return obj;
}

function createEntityObject(entityParameters, types) {
  var obj = { name: entityParameters[0][0], param: [], addParam: [] };
  for (var j = 1; j < entityParameters[0].length; j++) obj.addParam.push(entityParameters[0][j].substr(1));
  for (var i = 1; i < entityParameters.length; i++) obj.param.push(prepareObject(entityParameters, i, "entity"));

  obj = resolveType(obj, types);
  return obj;
}

function prepareObject(entityParameters, i, type) {

  var obj = { fieldName: entityParameters[i][0], fieldType: [] };
  validationController(entityParameters[i], type);
  for (var j = 1; j < entityParameters[i].length; j++) {
    obj.fieldType.push(entityParameters[i][j]);
  }
  return obj;
}

dataType = ['primary', 'key', 'decimal', 'unique', 'smallint', 'int', 'float', 'integer', 'text', 'bigint', 'boolean', 'date', 'time', 'timestamp', 'bool', 'now()', 'null', 'not', 'serial', 'default'];
function validationController(entityParameters, type) {
  var regPat = /((varchar|bit|varbit|char)[(]\d{1,20}[)])|(fk[\[]\w{1,20}[\]]|\d{1,20})/;

  if (isValid(entityParameters, regPat)) {
    if (type == 'type') dataType.push(entityParameters[0]);
  }
  else throw new Error("Error occured! Field type of " + entityParameters[0] + " is undefined. Please check database model.");
}

function isValid(entityParameters, regPat) {
  var valid = true;
  for (var i = 1; i < entityParameters.length; i++) {
    if (valid) {
      for (var j = 0; j < dataType.length; j++) {
        if (entityParameters[i] == dataType[j] || entityParameters[i].match(regPat)) {
          valid = true;
          break;
        } else valid = false;
      }
    }
  }
  return valid;
}

function checkIfRelated(param) {
  var isRelated = false
  var pattern = /fk[\[]\w{1,20}[\]]/;
  for(var i=0; i<param.length; i++) {
    if(param[i].match(pattern)) {
      isRelated = true
    }
    else isRelated = false
  }
  return isRelated
}

function createQuery(tables) {
  var query = []
  var pattern = /fk[\[]\w{1,20}[\]]/
  for(var i=0; i<tables.length; i++) {
    var queryText = ''
    queryText = 'CREATE TABLE IF NOT EXISTS ' + tables[i].name + ' ('
    for(var j=0; j < tables[i].param.length; j++) {
      var columnType = tables[i].param[j].fieldType
      for (var k = 0; k < columnType.length; k++) {
        if (columnType[k].match(pattern)) {
          columnType[k] =  'REFERENCES ' + columnType[k].slice(3, columnType[k].length - 1)
        }
      }
      columnType = columnType.join(" ")
      queryText += tables[i].param[j].fieldName + ' ' + columnType + ', '
    }
    queryText += ');'
    queryText = queryText.slice(0, queryText.length - 4)
    queryText += ');'
    query.push(queryText)
  }
  return query;
}

var model = objectifyModel('../testschema.txt')
var queriesCollection = createQuery(model.tables)
var dbEntities = []

const pg = require('pg')

const pool = new pg.Pool({
  database: 'library',
  user: 'postgres',
  password: '123',
  port: 8000,
})

function createModel () {
  pool.connect().then(client => {
    console.log('Successfuly connected to DB!')
    var queries = queriesCollection.map(queryItem => {
      console.log(queryItem)
      client.query(queryItem)
    })
    Promise.all(queries).then(() => {
      console.log('Database model has been created!')
      pool.end()
      client.end()
    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
}

function findDBTables(modelTables, queriesCollection) {
  var dbTables = []
  pool.connect((err, client, done) => {
    if (err) throw err
    var query = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"

    client.query(query, (err, res) => {
      done()
      if (err) {
        console.log(err.stack)
      } else {
        res.rows.forEach(item => {
          dbTables.push(item.table_name)
        })
        compareArrays(dbTables, modelTables, queriesCollection)
      }
    })
  })
}

function findAllColumnsForTable(table, sortedCollection) {
  pool.connect((err, client, done) => {
    if (err) throw err
    var query = "select column_name, data_type from information_schema.columns where table_schema='public' AND table_name='" + (table).toLowerCase() + "' order by column_name"

    client.query(query, (err, res) => {
      done()
      if (err) {
        console.log(err.stack)
      } else {
        compareDataTypes(sortedCollection, res.rows, table)
      }
    })
  })
}

function findColumnForTable(table, modelColumns, modelColumnWithTypes) {
  var tableColumns = []
  pool.connect((err, client, done) => {
    if (err) throw err
    var query = "select column_name, data_type from information_schema.columns where table_schema='public' AND table_name='" + (table).toLowerCase() + "' order by column_name"

    client.query(query, (err, res) => {
      done()
      if (err) {
        console.log(err.stack)
      } else {
        res.rows.forEach(item => {
          tableColumns.push(item.column_name)
        })
        compareAttributes(modelColumns, modelColumnWithTypes, tableColumns, table)
      }
    })
  })
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkConsistency (file, checkType, table) {
  var modelTables = []
  var collection = objectifyModel(file)
  var sortedCollection = collection.tables

  sortedCollection.map(tableItem => {
    tableItem.param.sort((a, b) => {
      var firstItem = a.fieldName.toUpperCase()
      var secondItem = b.fieldName.toUpperCase()
      return (firstItem < secondItem) ? -1 : (firstItem > secondItem) ? 1 : 0
    })
  })

  collection.tables.map(item => {
    modelTables.push(item.name.toLowerCase())
  })

  switch(checkType) {
    case 'entities':
      findDBTables(modelTables, queriesCollection)
      break

    case 'attributes':
      var modelColumns = []
      var modelColumnWithTypes = []
      collection.tables.map(item => {
        if (item.name === table) {
          item.param.map(column => {
            modelColumns.push(column.fieldName)
            modelColumnWithTypes.push({
              name: column.fieldName,
              type: column.fieldType
            })
          })
        }
      })
      findColumnForTable(table, modelColumns, modelColumnWithTypes)
      break
    
    case 'types':
      findAllColumnsForTable(table, sortedCollection)
      break
  }
}

function compareArrays (dbArray, modelArray, collection) {
  if (dbArray.length !== modelArray.length) {
    modelArray = modelArray.filter(val => !dbArray.includes(val))
    if (modelArray.length != null && modelArray.length > 0) {
      modelArray.map(item => {
        console.log('Table ' + item + ' is missing in Database structure!')
        collection.map(query => {
          var upperFirstLetterItem = capitalizeFirstLetter(item)
          if (query.includes('CREATE TABLE IF NOT EXISTS ' + upperFirstLetterItem)) {
            console.log('Try to run query: ' + query)
          }
        })
      })
    }
  }
  else {
    var copyOfModelArray = modelArray
    modelArray = modelArray.filter(val => !dbArray.includes(val))
    dbArray = dbArray.filter(val => !copyOfModelArray.includes(val))
    modelArray.map((modelItem, index) => {
      console.log('Table ' + modelArray[index] + ' is inconsistent.')
      console.log('Try to run query: ALTER TABLE ' + dbArray[index] + ' RENAME TO ' + modelArray[index])
    })
  }
}

function compareAttributes(modelColumn, modelColumnWithTypes, dbColumn, table) {
  console.log(dbColumn)
  var copyOfModelColumn = modelColumn
  modelColumn = modelColumn.filter(val => !dbColumn.includes(val))
  dbColumn = dbColumn.filter(val => !copyOfModelColumn.includes(val))
  if (dbColumn.length === modelColumn.length) {
    modelColumn.map((modelItem, index) => {
      console.log('COLUMN ' + modelColumn[index] + ' is inconsistent.')
      console.log('Try to run query: ALTER TABLE ' + (table).toLowerCase() + ' RENAME COLUMN ' + dbColumn[index] + ' TO ' + modelColumn[index])
    })
  }
  else {
    if (dbColumn.length > modelColumn.length) {
      dbColumn.map((dbItem, index) => {
        console.log('COLUMN ' + dbColumn[index] + ' is redundat in database structure!')
        console.log('Try to run query: ALTER TABLE ' + (table).toLowerCase() + ' DROP COLUMN ' + dbColumn[index])
      })
    }
    if (dbColumn.length < modelColumn.length) {
      modelColumn.map((modelItem, index) => {
        console.log('COLUMN ' + modelColumn[index] + ' is missing in database structure!')
        var columnTypeToAdd = ''
        modelColumnWithTypes.map(item => {
          if (item.name === modelColumn[index]) {
            if (item.type[0] === 'serial') item.type[0] = 'integer'
            if (item.type[0] === 'int') item.type[0] = 'integer'
            if (item.type[0].match(charRegex)) item.type[0] = 'character varying'
            if (item.type[0] === 'float') item.type[0] = 'double precision'
            if (item.type[0] === 'timestamp') item.type[0] = 'timestamp without time zone'
            columnTypeToAdd = item.type[0]
          }
        })
        console.log('Try to run query: ALTER TABLE ' + (table).toLowerCase() + ' ADD COLUMN ' + modelColumn[index] + columnTypeToAdd.join(" "))
      })
    }
  }
}

function compareDataTypes(modelCollection, dbColumns, table) {
  var charRegex = /(varchar|decimal|bit|varbit|char)./
  modelCollection.map((modelItem) => {
    if (modelItem.name === table) {
      modelItem.param.map((paramItem, index)=> {
        if (paramItem.fieldType[0] === 'serial') paramItem.fieldType[0] = 'integer'
        if (paramItem.fieldType[0] === 'int') paramItem.fieldType[0] = 'integer'
        if (paramItem.fieldType[0].match(charRegex)) paramItem.fieldType[0] = 'character varying'
        if (paramItem.fieldType[0] === 'float') paramItem.fieldType[0] = 'double precision'
        if (paramItem.fieldType[0] === 'timestamp') paramItem.fieldType[0] = 'timestamp without time zone'

        if (paramItem.fieldType[0] !== dbColumns[index].data_type && (dbColumns[index].data_type === 'character varying')) {
          console.log('The ' + dbColumns[index].data_type + ' data type in table ' + table + ' in column ' + paramItem.fieldName + ' is inconsistent!')
          console.log('Try to run query: ALTER TABLE ' + table + ' ALTER COLUMN ' + paramItem.fieldName + ' TYPE ' + paramItem.fieldType[0] + ' USING <' + paramItem.fieldName + '::' + paramItem.fieldType[0] + '>')
          console.log('----------------------------------------------------')
        }

        if (paramItem.fieldType[0] !== dbColumns[index].data_type && (dbColumns[index].data_type !== 'character varying')) {
          console.log('The ' + dbColumns[index].data_type + ' data type in table ' + table + ' in column ' + paramItem.fieldName + ' is inconsistent!')
          console.log('Try to run query: ALTER TABLE ' + table + ' ALTER COLUMN ' + paramItem.fieldName + ' TYPE ' + paramItem.fieldType[0])
          console.log('----------------------------------------------------')
        }
      })
    }
  })
}

function setReferenceTable(model) {
  var refTable = []
  model.tables.map(table => {
    var reference = ''
    var foreignKey = ''
    table.param.map(entry => {
      entry.fieldType.map(type => {
        if (type.includes('REFERENCES')) {
          reference = type.slice(11, type.length).toLowerCase()
          foreignKey = reference + '_id'
        }
      })
    })
    refTable.push({
      name: table.name.toLowerCase(),
      reference: reference,
      foreignKey: foreignKey,
    })
  })
  console.log('----------------------------------------------------')
  console.log(refTable)
  return refTable
}

function customQuery(startTable, startField, endTable, endField, value) {
  var currentTable = startTable
  var isFinished = false
  var refTable = setReferenceTable(model)
  refTable.reverse()
  var index = refTable.map(item => item.name).indexOf(startTable)
  if (index > 0) {
    refTable = refTable.slice(index, refTable.length + 1)
    console.log(refTable)
  }
  var query = 'SELECT ' + startField + ' FROM public.' + startTable + ' LEFT JOIN '
  refTable.map(entry => {
    if (entry.reference && entry.foreignKey && (entry.name !== endTable) && !isFinished) {
      currentTable = entry.name
      query += 'public.' + entry.reference + ' ON public.' + currentTable + '.' + entry.foreignKey + ' = public.' + entry.reference + '.' + entry.foreignKey + ' LEFT JOIN '
    }
    else {
      isFinished = true
    }
  })
  query = query.slice(0, -11) + ' WHERE public.' + endTable + '.' + endField + ' = ' + "'" + value + "'"
  console.log('----------------------------------------------------')
  console.log(query)
  return query
}

//customQuery('book', 'book_title', 'author', 'surname', 'Mickiewicz')
//customQuery('book', 'inventory', 'publication', 'title', 'publikacja')
//customQuery('book', 'inventory', 'edition', 'isbn', '2323s')
//customQuery('edition', 'isbn', 'publication', 'title', 'Poznań')
customQuery('edition', 'isbn', 'author', 'name', 'Sienkiewicz')

//objectifyModel('../model.txt')
//objectifyModel('../testschema.txt')
//createModel()
//checkConsistency('../model.txt', 'entities', 'Customer')
//checkConsistency('../model.txt', 'attributes', 'Customer')
//checkConsistency('../model.txt', 'types', 'Products')
