//importing file system package
const path = require('path');

//exporting path
module.exports = path.dirname(process.mainModule.filename);