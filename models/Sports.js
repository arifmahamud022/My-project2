var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Menu Sports Post Schema
var SportSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    sport_tag: {
        type: String,
    },
    
    sport_image: {
        type: String,
    },
    sport_description: {
        type: String,
    },
    sport_title: {
        type: String,
    },
    author: {
        type: String,
    },
    sport_seo_description: {
        type: String,
    },
    sport_seo_keywords: {
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

var Post = module.exports = mongoosedb.model('Sport', SportSchema);