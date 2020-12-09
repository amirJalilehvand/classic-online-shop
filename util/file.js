//importing file system package
const fs  = require('fs');

//exporting a delete-file function
exports.deleteFile = (filePath) => {
    fs.unlink(filePath ,err => {
        if(err) {
            throw new Error(err);
        }
    })
}