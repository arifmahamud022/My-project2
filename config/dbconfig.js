var mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/newstest');

mongoose.connect('mongodb+srv://adminexpress:8sX5ruyGiscOTpya@expressjs.ruclfye.mongodb.net/NewsPortalll?retryWrites=true&w=majority');

var mongoosedb = module.exports = mongoose;

