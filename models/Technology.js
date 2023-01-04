var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Menu Technology Post Schema
var TechnologySchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    technology_tag: {
        type: String,
    },
    
    technology_image: {
        type: String,
    },
    technology_description: {
        type: String,
    },
    technology_title: {
        type: String,
    },
    author: {
        type: String,
    },
    technology_seo_description: {
        type: String,
    },
    technology_seo_keywords: {
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

var Post = module.exports = mongoosedb.model('Technology', TechnologySchema);