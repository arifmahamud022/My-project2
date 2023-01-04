var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Post Schema
var PoliticSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    politic_tag: {
        type: String,
    },
    
    politic_image: {
        type: String,
    },
    politic_description: {
        type: String,
    },
    politic_title: {
        type: String,
    },
    author: {
        type: String,
    },
    politic_seo_description: {
        type: String,
    },
    politic_seo_keywords: {
        type: String,
    },
    view: {
        type: Number, default: 0,
    },
    date_at: {
        type: String,
        default: date,
    },
});

var Post = module.exports = mongoosedb.model('Politic', PoliticSchema);