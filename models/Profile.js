var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Post Schema
var ProfileSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    profile_tag: {
        type: String,
    },
    
    profile_image: {
        type: String,
    },
    profile_description: {
        type: String,
    },
    profile_title: {
        type: String,
    },
    author: {
        type: String,
    },
    profile_seo_description: {
        type: String,
    },
    profile_seo_keywords: {
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

var Profile = module.exports = mongoosedb.model('Profile', ProfileSchema);