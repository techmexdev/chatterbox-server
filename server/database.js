var fs = require('fs');

var Database = function (path) {
  this.database = [];
  this.loaded = false;
  this.path = path;

};

Database.prototype.saveDatabase = function() {
  this.loadDatabase();
  var wstream = fs.createWriteStream(this.path);
  // this.database.forEach(function(message) {
  wstream.write(JSON.stringify(this.database));
  // });
  wstream.end();
};

Database.prototype.insert = function (message) {
  
  this.loadDatabase();
  this.database.push(message);
  this.saveDatabase();
};

Database.prototype.loadDatabase = function () {
  if (this.loaded) { return; }
  var contents = '[]';
  try {
    contents = fs.readFileSync(this.path, 'utf8');
  } catch (err) {
    console.log('Finding database: ', err);
  }
  this.database = JSON.parse(contents);
  this.loaded = true;
};

Database.prototype.data = function () {
  this.loadDatabase();
  return this.database.slice(0);
};

module.exports.Database = Database;