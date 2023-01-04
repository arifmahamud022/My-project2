var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// Post Schema
var BannerSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    banner_tag: {
        type: String,
    },
    
    banner_image: {
        type: String,
    },
    banner_description: {
        type: String,
    },
    banner_title: {
        type: String,
    },
    author: {
        type: String,
    },
    banner_seo_description: {
        type: String,
    },
    banner_seo_keywords: {
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

var Post = module.exports = mongoosedb.model('Banner', BannerSchema);