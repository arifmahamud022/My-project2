var mongoosedb = require('../config/dbconfig');


let date = new Date();
date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

// second Post(Bannerb) Schema
var BannerbSchema = mongoosedb.Schema({
    slug: {
        type: String,
        index: true,
    },

    category: {
        type: String,
    },
    bannerb_tag: {
        type: String,
    },
    
    bannerb_image: {
        type: String,
    },
    bannerb_description: {
        type: String,
    },
    bannerb_title: {
        type: String,
    },
    author: {
        type: String,
    },
    bannerb_seo_description: {
        type: String,
    },
    bannerb_seo_keywords: {
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

var Bannerb = module.exports = mongoosedb.model('Bannerb', BannerbSchema);