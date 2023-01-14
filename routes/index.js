
// Import all Paclage
var express = require('express');
var router = express.Router();
var multer = require('multer');
require('dotenv').config()
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
      // cb(null, file.fieldname + '-' + Date.now() + '_' + file.originalname);
      cb(null, today + '_' + file.originalname);
  },
});

var upload = multer({ storage: storage });
// Import Authentication for admin and login

const { isAuth, isAdmin } = require('../config/auth')

const base_url = process.env.BASEURL || 'https://all-news-devxz.onrender.com';
// Models Schema
var User = require('../models/User');
var Categories = require('../models/Categories');
var Post = require('../models/Post');
var View = require('../models/View');
var Banner = require('../models/Banner');
var Bannerb = require('../models/Bannerb');
var Bannerc = require('../models/Bannerc');
var Bannerf = require('../models/Bannerf');
var Sport = require('../models/Sports');
var Technology = require('../models/Technology');
var Politic = require('../models/Politics');

// This is for Add View
const ViewAdd = async (req) => {
  let date = new Date();
  date = date.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const postid = req.params.slug;
  const userip = req.socket.remoteAddress || req.ip;
  const referer = req.headers.referer;

  const useragent = req.session.useragent = {
    browser: req.useragent.browser,
    version: req.useragent.version,
    os: req.useragent.os,
    platform: req.useragent.platform,
    geoIp: req.useragent.geoIp, 
    source: req.useragent.source,
  };

  const ifconfigRes = await fetch(`https://ifconfig.co/json?ip=${userip}`);
  const ifconfig = await ifconfigRes.json();

  const user_agent = useragent;
  const device = req.device.type;
  const platform = useragent.platform;
  const operating = useragent.os;
  const browser = useragent.browser;
  const browser_version = useragent.version;
  let country;
  let time_zone;
  let asn;
  let asn_org;

  if (ifconfig.asn) {
    country = ifconfig.country;
    time_zone = ifconfig.time_zone;
    asn = ifconfig.asn;
    asn_org = ifconfig.asn_org;
  } else {
    country = '';
    time_zone = '';
    asn = '';
    asn_org = '';
  }

  const viewData = new View({
    postid: postid,
    userip: userip,
    method: 'GET',
    host: base_url,
    url: `${base_url}/${postid}`,
    referer: referer,
    user_agent: user_agent,
    country: country,
    device: device,
    platform: platform,
    operating: operating,
    browser: browser,
    browser_version: browser_version,
    time_zone: time_zone,
    asn: asn,
    asn_org: asn_org,
  });

  const PostView = await View.find({ postid: postid });
  var updatePost = {
    view: PostView.length,
  };

  await Post.updateOne({ slug: postid }, updatePost);

  const view = await View.findOne({ postid: postid, userip: userip, date_at: date });
  console.log('view :- ', view);
  if (view == null) {
    const addView = await new View(viewData).save()
    console.log('addView : ', addView)
  }
}





/* GET home page. */
router.get('/', async function (req, res, next) {
  const posts = await Post.find({});
  const banners = await Banner.find({});
  const bannerbs = await Bannerb.find({});
  const bannercs = await Bannerc.find({});
  const bannerfs = await Bannerf.find({});
  const sports = await Sport.find({});
  const politics = await Politic.find({});
  const technologys = await Technology.find({});
  
  const data = {
    title: 'News',
    baseUrl: base_url,
    flashsms: req.flash('success'),
    flasherr: req.flash('error'),
    user: req.user,
    posts: posts,
    banners: banners,
    bannerbs: bannerbs,
    bannercs: bannercs,
    bannerfs: bannerfs,
    sports: sports,
    politics: politics,
    technologys: technologys,
    
  };
  res.render('index', data);
});




/* GET slug page. */
router.get('/news/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const posts = await Post.find({});
  const post = await Post.findOne({ slug: slug });
  if (post) {
    ViewAdd(req);
    const posts = await Post.find({});
    const data = {
      title: post.title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      post: post,
      posts: posts,
    };
    res.render('postView', data);
  } else {
    const data = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      posts: posts,
    };
    res.render('error404', data);
  }

});




/* GET slug page for banner. */
router.get('/newss/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const banners = await Banner.find({});
  const banner = await Banner.findOne({ slug: slug });
  if (banner) {
    ViewAdd(req);
    const banners = await Banner.find({});
    const bannerdata = {
      title: banner.banner_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      banner: banner,
      banners: banners,
    };
    res.render('bannerView', bannerdata);
  } else {
    const bannerdata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      banners: banners,
    };
    res.render('error404', bannerdata);
  }

});


// Get slug for BannerbView

router.get('/newsss/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const bannerbs = await Bannerb.find({});
  const bannerb = await Bannerb.findOne({ slug: slug });
  if (bannerb) {
    ViewAdd(req);
    const bannerbs = await Bannerb.find({});
    const bannerbdata = {
      title: bannerb.bannerb_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannerb: bannerb,
      bannerbs: bannerbs,
    };
    res.render('bannerbView', bannerbdata);
  } else {
    const bannerbdata = {
      title: 'News',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannerbs: bannerbs,
    };
    res.render('error404', bannerbdata);
  }

});

// Get slug for BannercView




router.get('/newssss/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const bannercs = await Bannerc.find({});
  const bannerc = await Bannerc.findOne({ slug: slug });
  if (bannerc) {
    ViewAdd(req);
    const bannercs = await Bannerc.find({});
    const bannercdata = {
      title: bannerc.bannerc_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannerc: bannerc,
      bannercs: bannercs,
    };
    res.render('bannercView', bannercdata);
  } else {
    const bannercdata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannercs: bannercs,
    };
    res.render('error404', bannercdata);
  }

});


// Get slug for BannerfView


router.get('/update-newss/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const bannerfs = await Bannerf.find({});
  const bannerf = await Bannerf.findOne({ slug: slug });
  if (bannerf) {
    ViewAdd(req);
    const bannerfs = await Bannerf.find({});
    const bannerfdata = {
      title: bannerf.bannerf_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannerf: bannerf,
      bannerfs: bannerfs,
    };
    res.render('bannerfView', bannerfdata);
  } else {
    const bannerfdata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      bannerfs: bannerfs,
    };
    res.render('error404', bannerfdata);
  }

});



// Sports Page Route

/* . */
router.get('/Sports', async function (req, res, next) {
  const sports = await Sport.find({});
  const data = {
    title: 'News',
    baseUrl: base_url,
    flashsms: req.flash('success'),
    flasherr: req.flash('error'),
    user: req.user,
    sports: sports,
  };
  res.render('Sports', data);
});


// sport slug for sportView


router.get('/sports/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const sports = await Sport.find({});
  const sport = await Sport.findOne({ slug: slug });
  if (sport) {
    ViewAdd(req);
    const sports = await Sport.find({});
    const sportdata = {
      title: sport.sport_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      sport: sport,
      sports: sports,
    };
    res.render('sportView', sportdata);
  } else {
    const sportdata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      sports: sports,
    };
    res.render('error404', sportdata);
  }

});




// Menu Category Politics slug and politicView Route

router.get('/politics/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const politics = await Politic.find({});
  const politic = await Politic.findOne({ slug: slug });
  if (politic) {
    ViewAdd(req);
    const politics = await Politic.find({});
    const politicdata = {
      title: politic.politic_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      politic: politic,
      politics: politics,
    };
    res.render('politicView', politicdata);
  } else {
    const politicdata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      politics: politics,
    };
    res.render('error404', politicdata);
  }

});


// Politics Page Route

/* . */
router.get('/Politics', async function (req, res, next) {
  const politics = await Politic.find({});
  const data = {
    title: 'News',
    baseUrl: base_url,
    flashsms: req.flash('success'),
    flasherr: req.flash('error'),
    user: req.user,
    politics: politics,
  };
  res.render('Politics', data);
});

// Menu Category Technology Routes

// Technology page route
router.get('/technology', async function (req, res, next) {
  const technologys = await Technology.find({});
  const data = {
    title: 'News',
    baseUrl: base_url,
    flashsms: req.flash('success'),
    flasherr: req.flash('error'),
    user: req.user,
    technologys: technologys,
  };
  res.render('technology', data);
});


router.get('/technologys/:slug', async function (req, res, next) {

  let slug = req.params.slug;
  console.log('slug :- ', slug);
  const technologys = await Technology.find({});
  const technology = await Technology.findOne({ slug: slug });
  if (technology) {
    ViewAdd(req);
    const technologys = await Technology.find({});
    const technologydata = {
      title: technology.technology_title,
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      technology: technology,
      technologys: technologys,
    };
    res.render('technologyView', technologydata);
  } else {
    const technologydata = {
      title: 'Nes Express',
      baseUrl: base_url,
      flashsms: req.flash('success'),
      flasherr: req.flash('error'),
      user: req.user,
      technologys: technologys,
    };
    res.render('error404', technologydata);
  }

});







// login Page Route

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'User account login', flashsms: req.flash('success'), user: req.user });
});
// Register Page Route

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'User account register', errors: '', user: req.user });
});


router.get('/postView', function (req, res, next) {
  res.render('postView', { title: 'User account login', flashsms: req.flash('success'),flasherr: req.flash('error'), user: req.user });
});












module.exports = router;
