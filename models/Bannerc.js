var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// 3rd Post(Bannerc) Schema
var BannercSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    bannerc_tag: {
        type: String,
    },
    
    bannerc_image: {
        type: String,
    },
    bannerc_description: {
        type: String,
    },
    bannerc_title: {
        type: String,
    },
    author: {
        type: String,
    },
    bannerc_seo_description: {
        type: String,
    },
    bannerc_seo_keywords: {
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

var Bannerc = module.exports = mongoosedb.model('Bannerc', BannercSchema);