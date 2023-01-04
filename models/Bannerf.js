var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Post Schema
var BannerfSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    bannerf_tag: {
        type: String,
    },
    
    bannerf_image: {
        type: String,
    },
    bannerf_description: {
        type: String,
    },
    bannerf_title: {
        type: String,
    },
    author: {
        type: String,
    },
    bannerf_seo_description: {
        type: String,
    },
    bannerf_seo_keywords: {
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

var Bannerf = module.exports = mongoosedb.model('Bannerf', BannerfSchema);