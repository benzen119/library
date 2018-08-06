function readFile(fileName) {
  var fs = require('fs'),
  data = fs.readFileSync(fileName, 'utf-8')
  data = data.toString().split('\n')

  var model = []
  var modelCollection = []

  for (var i = 0; i < data.length; i++) {
    data[i] = data[i].trim().split(/\s+/)
    if (data[i].toString().charAt(0) !== '') model.push(data[i])
    else {
      modelCollection.push(model)
      model = []
    }
  }
  console.log(modelCollection)
}

readFile('./model.txt')