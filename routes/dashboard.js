var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
require('dotenv').config()

var today = Date.now();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        // cb(null, file.fieldname + '-' + Date.now() + '_' + file.originalname);
        cb(null, today + '_' + file.originalname);
    },
});
// import package

var upload = multer({ storage: storage });

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');
// import Models Schema
var User = require('../models/User');
var Categories = require('../models/Categories');
var Post = require('../models/Post');
var Banner = require('../models/Banner');
var Bannerb = require('../models/Bannerb');
var Bannerc = require('../models/Bannerc');
var Bannerf = require('../models/Bannerf');
var Sport = require('../models/Sports');
var Politic = require('../models/Politics');
var Technology = require('../models/Technology');
var View = require('../models/View');

// This is Authentication import
const { isAdmin,isAuth } = require('../config/auth');


const base_url = process.env.BASEURL || 'https://my-news-bya.onrender.com';



/* GET dashboard page. */
router.get('/', isAdmin, function (req, res, next) {
    res.render('dashboard/dashboard', {
        title: 'Dashboard | Admin Dashboard',
        baseUrl: base_url,
        flashsms: req.flash('success'),
        user: req.user,
    });
});

/* GET new user page. */
router.get('/new-user', isAdmin, function (req, res, next) {
    res.render('dashboard/newUser', {
        title: 'New User  | Admin Dashboard',
        baseUrl: base_url,
        flashsms: req.flash('success'),
        user: req.user,
        errors: '',
    });
});


// Use add Route
router.post('/user-add', isAdmin,
    body('name', 'Name is required.').notEmpty(),
    body('email', 'Email is required.').notEmpty(),
    body('email', 'Email is not valid.').isEmail(),
    body('username', 'Username is required.').notEmpty(),
    body('password', 'Password is min 6.').isLength({ min: 6 }),
    body('role', 'Role is required.').notEmpty(),
    async function (req, res, next) {
        var name = req.body.name;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var role = req.body.role;
        console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            res.render('dashboard/newuser', {
                title: 'Add new user account',
                baseUrl: base_url,
                user: req.user,
                errors: errdt,
            });
        } else {
            const HashedPassword = await bcrypt.hash(password, 10)

            var newUser = new User({
                name: name,
                email: email,
                username: username,
                password: HashedPassword,
                profileimg: '',
                role: role,
            });

            const userName = await User.findOne({ username: username });

            if (userName) {
                const errdt = [
                    {
                        value: username,
                        msg: `${username} This username isn't available!!!`,
                        param: 'username',
                        location: 'body'
                    }
                ];
                res.render('dashboard/newuser', {
                    title: 'Add new user account',
                    baseUrl: base_url,
                    user: req.user,
                    errors: errdt,
                });
            } else {
                const emailData = await User.findOne({ email: email });
                if (emailData) {
                    const errdt = [
                        {
                            value: email,
                            msg: `${email} This email isn't available!!!`,
                            param: 'email',
                            location: 'body'
                        }
                    ];
                    res.render('dashboard/newuser', {
                        title: 'Add new user account',
                        baseUrl: base_url,
                        user: req.user,
                        errors: errdt,
                    });
                } else {
                    const addUser = await new User(newUser).save()
                    console.log('addUser : ', addUser);
                    req.flash('success', 'You are now registered and can loging now..')
                    res.location('/dashboard/user-list');
                    res.redirect('/dashboard/user-list');
                }
            }
        }
    }
);


/* GET user list page. */
router.get('/user-list', isAdmin, async function (req, res, next) {
    const users = await User.find({});
    res.render('dashboard/userList', {
        title: 'User account List | Admin Dashboard',
        baseUrl: base_url,
        flashsms: req.flash('success'),
        user: req.user,
        users: users,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});



//  User Edit Page
router.get('/user-edit', isAdmin, async function (req, res, next) {

    const userEdit = await User.findById(req.query.id);
    // console.log('user :- ', userEdit);
    const data = {
        title: 'User account LEditist | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        userEdit: userEdit,
        flashsms: req.flash('success'),
        errors: '',
    };

    res.render('dashboard/userEdit', data);
});

//  User Update Route
router.post('/user-update', isAdmin,
    body('name', 'Name is required.').notEmpty(),
    body('email', 'Email is required.').notEmpty(),
    body('email', 'Email is not valid.').isEmail(),
    body('username', 'Username is required.').notEmpty(),
    body('role', 'Role is required.').notEmpty(),

    async function (req, res, next) {
        var id = req.body.id;
        var name = req.body.name;
        var email = req.body.email;
        var username = req.body.username;
        var role = req.body.role;

        // console.log('req.body :- ', req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const userEdit = await User.findById(id);
            const data = {
                title: 'User account Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                userEdit: userEdit,
                flashsms: req.flash('success'),
                errors: errors.errors,
            };
            res.render('dashboard/userEdit', data);
        } else {
            var updateUser = {
                name: name,
                email: email,
                username: username,
                role: role,
            };

            const upData = await User.updateOne({ _id: id }, updateUser);

            console.log('User Update :- ', upData);

            req.flash('success', 'User update sucssesfuly...')
            res.location(`/dashboard/user-edit?id=${id}`);
            res.redirect(`/dashboard/user-edit?id=${id}`);
        }


    }
);

//  User delete Route
router.get('/user-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await User.deleteOne({ _id: id });
    console.log('User delete :- ', delData);
    res.send('User delete');
});

/* GET Category  List page. */
router.get('/category', isAdmin, async function (req, res, next) {
    const categories = await Categories.find({});

    const parentName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let category = [];

    categories.forEach((cat) => {
        // console.log(' :- ', cat)

        category.push({
            _id: cat._id,
            slug: cat.slug,
            title: cat.title,
            parent_cat: `${parentName(cat.parent_cat)}`,
            seo_description: cat.seo_description,
            seo_keywords: cat.seo_keywords,
            date_at: cat.date_at,
            __v: cat.__v
        })
    })

    res.render('dashboard/category', {
        title: 'Category List | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        categories: category,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* New Category Add. */
router.get('/new-category', isAdmin, async function (req, res, next) {

    const categoryList = await Categories.find({});
    res.render('dashboard/newCategory', {
        title: 'New Category | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        categoryList: categoryList,
        errors: '',
    });
});

/* Category-add Router */
router.post('/category-add', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    async function (req, res, next) {
        let title = req.body.title;
        let parent_cat = req.body.parent_cat;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/newCategory', {
                title: 'New Category | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                categoryList: categoryList,
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const categories = await Categories.find({});
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(categories[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }


            var newCat = new Categories({
                slug: newSlug,
                title: title,
                parent_cat: parent_cat,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            });

            const addCat = await new Categories(newCat).save()

            console.log('addCat : ', addCat);

            req.flash('success', 'Category add sucssefuly...')
            res.location('/dashboard/category');
            res.redirect('/dashboard/category');
        }

    }
);

/* New Category Add. */
router.get('/category-edit', isAdmin, async function (req, res, next) {

    let catId = req.query.id;
    const category = await Categories.findOne({ _id: catId });
    const categoryList = await Categories.find({});
    res.render('dashboard/CategoryEdit', {
        title: 'Category Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        category: category,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* Category-update Router */
router.post('/category-update', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    async function (req, res, next) {
        let id = req.body.id;
        let title = req.body.title;
        let parent_cat = req.body.parent_cat;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const category = await Categories.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/CategoryEdit', {
                title: 'Category Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                category: category,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const categories = await Categories.find({});
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(categories[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var updateCat = {
                slug: newSlug,
                title: title,
                parent_cat: parent_cat,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            };

            const upData = await Categories.updateOne({ _id: id }, updateCat);

            // console.log('Category Update :- ', upData);

            req.flash('success', 'Category update sucssesfuly...')
            res.location(`/dashboard/category-edit?id=${id}`);
            res.redirect(`/dashboard/category-edit?id=${id}`);
        }

    }
);

//  User delete Route
router.get('/cat-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Categories.deleteOne({ _id: id });
    console.log('Categories delete :- ', delData);
    res.send('Categories delete');
});


/* GET post list page. */
router.get('/post-list', isAdmin, async function (req, res, next) {
    const posts = await Post.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let postsList = [];

    posts.forEach(async (post) => {
        postsList.push({
            _id: post._id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            category: `${catName(post.category)}`,
            tag: post.tag,
            featured_image: post.featured_image,
            author: `${userName(post.author)}`,
            seo_description: post.seo_description,
            seo_keywords: post.seo_keywords,
            view: post.view,
            date_at: post.date_at,
            __v: post.__v
        })
    })

    res.render('dashboard/postList', {
        title: 'Post List | Admin Dashboard',
        baseUrl: base_url,
        posts: postsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

/* New post Add. */
router.get('/new-post', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/newPost', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* post add Router */
router.post('/post-add', isAdmin,
    upload.single('featured_image'),
    body('title', 'Title is required.').notEmpty(),
    body('description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.').notEmpty(),
    async function (req, res, next) {
        let title = req.body.title;
        let description = req.body.description;
        let category = req.body.category;
        let tag = req.body.tag;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var featured_image = today + '_' + req.file.originalname;
        } else {
            var featured_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/newPost', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const posts = await Post.find({});
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(posts[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newPost = new Post({
                slug: newSlug,
                title: title,
                description: description,
                category: category,
                tag: tag,
                featured_image: featured_image,
                category: category,
                author: req.user._id,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            });

            const addPost = await new Post(newPost).save()

            console.log('addPost : ', addPost);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/post-list');
            res.redirect('/dashboard/post-list');
        }

    }
);

/* New post Add. */
router.get('/post-edit', isAdmin, async function (req, res, next) {

    let postId = req.query.id;
    const post = await Post.findOne({ _id: postId });
    const categoryList = await Categories.find({});
    res.render('dashboard/postEdit', {
        title: 'Post Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        post: post,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* post update Router */
router.post('/post-update', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    body('description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.').notEmpty(),
    async function (req, res, next) {
        let id = req.body.id;
        let title = req.body.title;
        let description = req.body.description;
        let category = req.body.category;
        let tag = req.body.tag;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const post = await Post.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/postEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                post: post,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const posts = await Post.find({});
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(posts[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updatePost = {
                slug: newSlug,
                title: title,
                description: description,
                category: category,
                tag: tag,
                category: category,
                author: req.user._id,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            };

            const upData = await Post.updateOne({ _id: id }, updatePost);

            console.log('Post Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/post-edit?id=${id}`);
            res.redirect(`/dashboard/post-edit?id=${id}`);
        }

    }
);

/* post image upload Router */
router.post('/post-image',
    upload.single('featured_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const post = await Post.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var featured_image = today + '_' + req.file.originalname;
        } else {
            var featured_image = post.featured_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/postEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                post: post,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updatePost = {
                featured_image: featured_image,
            };

            const upData = await Post.updateOne({ _id: id }, updatePost);

            console.log('Post Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/post-edit?id=${id}`);
            res.redirect(`/dashboard/post-edit?id=${id}`);
        }

    }
);

// Post delete Route
router.get('/post-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Post.deleteOne({ _id: id });
    console.log('Post delete :- ', delData);
    res.send('Categories delete');
});



/* banner image upload Router */
router.post('/banner-image',
    upload.single('banner_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const banner = await Banner.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var banner_image = today + '_' + req.file.originalname;
        } else {
            var banner_image = banner.banner_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerEdit', {
                title: 'Banner Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                banner: banner,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateBanner = {
                banner_image: banner_image,
            };

            const upData = await Banner.updateOne({ _id: id }, updateBanner);

            console.log('Banner Update :- ', upData);

            req.flash('success', 'banner update sucssesfuly...')
            res.location(`/dashboard/banner-edit?id=${id}`);
            res.redirect(`/dashboard/banner-edit?id=${id}`);
        }

    }
);
// banner-details page route
router.get('/banner-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/banner-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// banner-post-add

router.post('/banner-add', isAdmin,
    upload.single('banner_image'),
    body('banner_title', 'Title is required.').notEmpty(),
    body('banner_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let banner_title = req.body.banner_title;
        let banner_description = req.body.banner_description;
        let category = req.body.category;
        let banner_tag = req.body.banner_tag;
        let banner_seo_description = req.body.banner_seo_description;
        let banner_seo_keywords = req.body.banner_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var banner_image = today + '_' + req.file.originalname;
        } else {
            var banner_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/banner-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = banner_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const banners = await Banner.find({});
            for (var i = 0; i < banners.length; i++) {
                if (banners[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(banners[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Banner({
                slug: newSlug,
                banner_title: banner_title,
                banner_description: banner_description,
                category: category,
                banner_tag: banner_tag,
                banner_image: banner_image,
                category: category,
                author: req.user._id,
                banner_seo_description: banner_seo_description,
                banner_seo_keywords: banner_seo_keywords,
            });

            const addBanner = await new Banner(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/banner-details');
            res.redirect('/dashboard/banner-details');
        }

    }
);

// banner post edit
router.get('/banner-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const banner = await Banner.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerEdit', {
        title: 'Banner Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        banner: banner,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* banner update Router */
router.post('/banner-update', isAdmin,
    body('banner_title', 'Title is required.').notEmpty(),
    body('banner_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let banner_title = req.body.banner_title;
        let banner_description = req.body.banner_description;
        let category = req.body.category;
        let banner_tag = req.body.banner_tag;
        let banner_seo_description = req.body.banner_seo_description;
        let banner_seo_keywords = req.body.banner_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const banner = await Banner.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                banner: banner,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const banner = await Banner.find({});
            for (var i = 0; i < banner.length; i++) {
                if (banner[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(banner[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateBanner = {
                slug: newSlug,
                banner_title: banner_title,
                banner_description: banner_description,
                category: category,
                banner_tag: banner_tag,
                category: category,
                author: req.user._id,
                banner_seo_description: banner_seo_description,
                banner_seo_keywords: banner_seo_keywords,
            };

            const upData = await Banner.updateOne({ _id: id }, updateBanner);

            console.log('banner Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/banner-edit?id=${id}`);
            res.redirect(`/dashboard/banner-edit?id=${id}`);
        }

    }
);

/* GET banner list page. */
router.get('/banner-list', isAdmin, async function (req, res, next) {
    const banners = await Banner.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let bannersList = [];

    banners.forEach(async (banner) => {
        bannersList.push({
            _id: banner._id,
            slug: banner.slug,
            banner_title: banner.banner_title,
            banner_description: banner.banner_description,
            category: `${catName(banner.category)}`,
            banner_tag: banner.banner_tag,
            banner_image: banner.banner_image,
            author: `${userName(banner.author)}`,
            banner_seo_description: banner.banner_seo_description,
            banner_seo_keywords: banner.banner_seo_keywords,
            view: banner.view,
            date_at: banner.date_at,
            __v: banner.__v
        })
    })

    res.render('dashboard/bannerlist', {
        title: 'banner List | Admin Dashboard',
        baseUrl: base_url,
        banners: bannersList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// banner-del
router.get('/banner-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Banner.deleteOne({ _id: id });
    console.log('Banner delete :- ', delData);
    res.send('Categories delete');
});





// Banner -B (Second Banner -Bannerb)




/* bannerb image upload Router */
router.post('/bannerb-image',
    upload.single('bannerb_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const bannerb = await Bannerb.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var bannerb_image = today + '_' + req.file.originalname;
        } else {
            var bannerb_image = bannerb.bannerb_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerbEdit', {
                title: 'Bannerb Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerb: bannerb,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateBannerb = {
                bannerb_image: bannerb_image,
            };

            const upData = await Bannerb.updateOne({ _id: id }, updateBannerb);

            console.log('Bannerb Update :- ', upData);

            req.flash('success', 'bannerb update sucssesfuly...')
            res.location(`/dashboard/bannerb-edit?id=${id}`);
            res.redirect(`/dashboard/bannerb-edit?id=${id}`);
        }

    }
);
// bannerb-details page route
router.get('/bannerb-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerb-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// bannerb-post-add

router.post('/bannerb-add', isAdmin,
    upload.single('bannerb_image'),
    body('bannerb_title', 'Title is required.').notEmpty(),
    body('bannerb_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let bannerb_title = req.body.bannerb_title;
        let bannerb_description = req.body.bannerb_description;
        let category = req.body.category;
        let bannerb_tag = req.body.bannerb_tag;
        let bannerb_seo_description = req.body.bannerb_seo_description;
        let bannerb_seo_keywords = req.body.bannerb_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var bannerb_image = today + '_' + req.file.originalname;
        } else {
            var bannerb_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerbs-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = bannerb_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannerbs = await Bannerb.find({});
            for (var i = 0; i < bannerbs.length; i++) {
                if (bannerbs[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannerbs[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Bannerb({
                slug: newSlug,
                bannerb_title: bannerb_title,
                bannerb_description: bannerb_description,
                category: category,
                bannerb_tag: bannerb_tag,
                bannerb_image: bannerb_image,
                category: category,
                author: req.user._id,
                bannerb_seo_description: bannerb_seo_description,
                bannerb_seo_keywords: bannerb_seo_keywords,
            });

            const addBanner = await new Bannerb(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/bannerb-details');
            res.redirect('/dashboard/bannerb-details');
        }

    }
);

// bannerb post edit
router.get('/bannerb-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const bannerb = await Bannerb.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerbEdit', {
        title: 'Bannerb Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        bannerb: bannerb,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* bannerb update Router */
router.post('/bannerb-update', isAdmin,
    body('bannerb_title', 'Title is required.').notEmpty(),
    body('bannerb_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let bannerb_title = req.body.bannerb_title;
        let bannerb_description = req.body.bannerb_description;
        let category = req.body.category;
        let bannerb_tag = req.body.bannerb_tag;
        let bannerb_seo_description = req.body.bannerb_seo_description;
        let bannerb_seo_keywords = req.body.bannerb_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const bannerb = await Bannerb.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerbEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerb: bannerb,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannerb = await Bannerb.find({});
            for (var i = 0; i < bannerb.length; i++) {
                if (bannerb[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannerb[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateBannerb = {
                slug: newSlug,
                bannerb_title: bannerb_title,
                bannerb_description: bannerb_description,
                category: category,
                bannerb_tag: bannerb_tag,
                category: category,
                author: req.user._id,
                bannerb_seo_description: bannerb_seo_description,
                bannerb_seo_keywords: bannerb_seo_keywords,
            };

            const upData = await Bannerb.updateOne({ _id: id }, updateBannerb);

            console.log('bannerb Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/bannerb-edit?id=${id}`);
            res.redirect(`/dashboard/bannerb-edit?id=${id}`);
        }

    }
);

/* GET bannerb list page. */
router.get('/bannerb-list', isAdmin, async function (req, res, next) {
    const bannerbs = await Bannerb.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let bannerbsList = [];

    bannerbs.forEach(async (bannerb) => {
        bannerbsList.push({
            _id: bannerb._id,
            slug: bannerb.slug,
            bannerb_title: bannerb.bannerb_title,
            bannerb_description: bannerb.bannerb_description,
            category: `${catName(bannerb.category)}`,
            bannerb_tag: bannerb.bannerb_tag,
            bannerb_image: bannerb.bannerb_image,
            author: `${userName(bannerb.author)}`,
            bannerb_seo_description: bannerb.bannerb_seo_description,
            bannerb_seo_keywords: bannerb.bannerb_seo_keywords,
            view: bannerb.view,
            date_at: bannerb.date_at,
            __v: bannerb.__v
        })
    })

    res.render('dashboard/bannerblist', {
        title: 'bannerb List | Admin Dashboard',
        baseUrl: base_url,
        bannerbs: bannerbsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// bannerb-del
router.get('/bannerb-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Bannerb.deleteOne({ _id: id });
    console.log('Bannerb delete :- ', delData);
    res.send('Categories delete');
});



// Banner C -Third Banner(bannerc)




/* bannerc image upload Router */
router.post('/bannerc-image',
    upload.single('bannerc_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const bannerc = await Bannerc.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var bannerc_image = today + '_' + req.file.originalname;
        } else {
            var bannerc_image = bannerc.bannerc_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannercEdit', {
                title: 'Bannerc Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerc: bannerc,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateBannerc = {
                bannerc_image: bannerc_image,
            };

            const upData = await Bannerc.updateOne({ _id: id }, updateBannerc);

            console.log('Bannerc Update :- ', upData);

            req.flash('success', 'bannerc update sucssesfuly...')
            res.location(`/dashboard/bannerc-edit?id=${id}`);
            res.redirect(`/dashboard/bannerc-edit?id=${id}`);
        }

    }
);
// bannerc-details page route
router.get('/bannerc-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerc-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// bannerc-post-add

router.post('/bannerc-add', isAdmin,
    upload.single('bannerc_image'),
    body('bannerc_title', 'Title is required.').notEmpty(),
    body('bannerc_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let bannerc_title = req.body.bannerc_title;
        let bannerc_description = req.body.bannerc_description;
        let category = req.body.category;
        let bannerc_tag = req.body.bannerc_tag;
        let bannerc_seo_description = req.body.bannerc_seo_description;
        let bannerc_seo_keywords = req.body.bannerc_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var bannerc_image = today + '_' + req.file.originalname;
        } else {
            var bannerc_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannercs-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = bannerc_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannercs = await Bannerc.find({});
            for (var i = 0; i < bannercs.length; i++) {
                if (bannercs[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannercs[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Bannerc({
                slug: newSlug,
                bannerc_title: bannerc_title,
                bannerc_description: bannerc_description,
                category: category,
                bannerc_tag: bannerc_tag,
                bannerc_image: bannerc_image,
                category: category,
                author: req.user._id,
                bannerc_seo_description: bannerc_seo_description,
                bannerc_seo_keywords: bannerc_seo_keywords,
            });

            const addBanner = await new Bannerc(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/bannerc-details');
            res.redirect('/dashboard/bannerc-details');
        }

    }
);

// bannerc post edit
router.get('/bannerc-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const bannerc = await Bannerc.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/bannercEdit', {
        title: 'Bannerc Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        bannerc: bannerc,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* bannerc update Router */
router.post('/bannerc-update', isAdmin,
    body('bannerc_title', 'Title is required.').notEmpty(),
    body('bannerc_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let bannerc_title = req.body.bannerc_title;
        let bannerc_description = req.body.bannerc_description;
        let category = req.body.category;
        let bannerc_tag = req.body.bannerc_tag;
        let bannerc_seo_description = req.body.bannerc_seo_description;
        let bannerc_seo_keywords = req.body.bannerc_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const bannerc = await Bannerc.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/bannercEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerc: bannerc,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannerc = await Bannerc.find({});
            for (var i = 0; i < bannerc.length; i++) {
                if (bannerc[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannerc[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateBannerc = {
                slug: newSlug,
                bannerc_title: bannerc_title,
                bannerc_description: bannerc_description,
                category: category,
                bannerc_tag: bannerc_tag,
                category: category,
                author: req.user._id,
                bannerc_seo_description: bannerc_seo_description,
                bannerc_seo_keywords: bannerc_seo_keywords,
            };

            const upData = await Bannerc.updateOne({ _id: id }, updateBannerc);

            console.log('bannerc Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/bannerc-edit?id=${id}`);
            res.redirect(`/dashboard/bannerc-edit?id=${id}`);
        }

    }
);

/* GET bannerc list page. */
router.get('/bannerc-list', isAdmin, async function (req, res, next) {
    const bannercs = await Bannerc.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let bannercsList = [];

    bannercs.forEach(async (bannerc) => {
        bannercsList.push({
            _id: bannerc._id,
            slug: bannerc.slug,
            bannerc_title: bannerc.bannerc_title,
            bannerc_description: bannerc.bannerc_description,
            category: `${catName(bannerc.category)}`,
            bannerc_tag: bannerc.bannerc_tag,
            bannerc_image: bannerc.bannerc_image,
            author: `${userName(bannerc.author)}`,
            bannerc_seo_description: bannerc.bannerc_seo_description,
            bannerc_seo_keywords: bannerc.bannerc_seo_keywords,
            view: bannerc.view,
            date_at: bannerc.date_at,
            __v: bannerc.__v
        })
    })

    res.render('dashboard/bannerclist', {
        title: 'bannerc List | Admin Dashboard',
        baseUrl: base_url,
        bannercs: bannercsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// bannerc-del
router.get('/bannerc-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Bannerc.deleteOne({ _id: id });
    console.log('Bannerc delete :- ', delData);
    res.send('Categories delete');
});







// Sixth Banner - Banner F (bannerf)



/* bannerf image upload Router */
router.post('/bannerf-image',
    upload.single('bannerf_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const bannerf = await Bannerf.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var bannerf_image = today + '_' + req.file.originalname;
        } else {
            var bannerf_image = bannerf.bannerf_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerfEdit', {
                title: 'Bannerf Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerf: bannerf,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateBannerf = {
                bannerf_image: bannerf_image,
            };

            const upData = await Bannerf.updateOne({ _id: id }, updateBannerf);

            console.log('Bannerf Update :- ', upData);

            req.flash('success', 'bannerf update sucssesfuly...')
            res.location(`/dashboard/bannerf-edit?id=${id}`);
            res.redirect(`/dashboard/bannerf-edit?id=${id}`);
        }

    }
);
// bannerf-details page route
router.get('/bannerf-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerf-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// bannerf-post-add

router.post('/bannerf-add', isAdmin,
    upload.single('bannerf_image'),
    body('bannerf_title', 'Title is required.').notEmpty(),
    body('bannerf_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let bannerf_title = req.body.bannerf_title;
        let bannerf_description = req.body.bannerf_description;
        let category = req.body.category;
        let bannerf_tag = req.body.bannerf_tag;
        let bannerf_seo_description = req.body.bannerf_seo_description;
        let bannerf_seo_keywords = req.body.bannerf_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var bannerf_image = today + '_' + req.file.originalname;
        } else {
            var bannerf_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerfs-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = bannerf_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannerfs = await Bannerf.find({});
            for (var i = 0; i < bannerfs.length; i++) {
                if (bannerfs[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannerfs[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Bannerf({
                slug: newSlug,
                bannerf_title: bannerf_title,
                bannerf_description: bannerf_description,
                category: category,
                bannerf_tag: bannerf_tag,
                bannerf_image: bannerf_image,
                category: category,
                author: req.user._id,
                bannerf_seo_description: bannerf_seo_description,
                bannerf_seo_keywords: bannerf_seo_keywords,
            });

            const addBanner = await new Bannerf(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/bannerf-details');
            res.redirect('/dashboard/bannerf-details');
        }

    }
);

// bannerf post edit
router.get('/bannerf-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const bannerf = await Bannerf.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/bannerfEdit', {
        title: 'Bannerf Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        bannerf: bannerf,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* bannerf update Router */
router.post('/bannerf-update', isAdmin,
    body('bannerf_title', 'Title is required.').notEmpty(),
    body('bannerf_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let bannerf_title = req.body.bannerf_title;
        let bannerf_description = req.body.bannerf_description;
        let category = req.body.category;
        let bannerf_tag = req.body.bannerf_tag;
        let bannerf_seo_description = req.body.bannerf_seo_description;
        let bannerf_seo_keywords = req.body.bannerf_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const bannerf = await Bannerf.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/bannerfEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                bannerf: bannerf,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = bannerf_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const bannerf = await Bannerf.find({});
            for (var i = 0; i < bannerf.length; i++) {
                if (bannerf[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(bannerf[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateBannerf = {
                slug: newSlug,
                bannerf_title: bannerf_title,
                bannerf_description: bannerf_description,
                category: category,
                bannerf_tag: bannerf_tag,
                category: category,
                author: req.user._id,
                bannerf_seo_description: bannerf_seo_description,
                bannerf_seo_keywords: bannerf_seo_keywords,
            };

            const upData = await Bannerf.updateOne({ _id: id }, updateBannerf);

            console.log('bannerf Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/bannerf-edit?id=${id}`);
            res.redirect(`/dashboard/bannerf-edit?id=${id}`);
        }

    }
);

/* GET bannerf list page. */
router.get('/bannerf-list', isAdmin, async function (req, res, next) {
    const bannerfs = await Bannerf.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let bannerfsList = [];

    bannerfs.forEach(async (bannerf) => {
        bannerfsList.push({
            _id: bannerf._id,
            slug: bannerf.slug,
            bannerf_title: bannerf.bannerf_title,
            bannerf_description: bannerf.bannerf_description,
            category: `${catName(bannerf.category)}`,
            bannerf_tag: bannerf.bannerf_tag,
            bannerf_image: bannerf.bannerf_image,
            author: `${userName(bannerf.author)}`,
            bannerf_seo_description: bannerf.bannerf_seo_description,
            bannerf_seo_keywords: bannerf.bannerf_seo_keywords,
            view: bannerf.view,
            date_at: bannerf.date_at,
            __v: bannerf.__v
        })
    })

    res.render('dashboard/bannerfist', {
        title: 'bannerf List | Admin Dashboard',
        baseUrl: base_url,
        bannerfs: bannerfsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// bannerf-del
router.get('/bannerf-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Bannerf.deleteOne({ _id: id });
    console.log('Bannerf delete :- ', delData);
    res.send('Categories delete');
});




// This is Menu Category Sports Post Route




/* sport image upload Router */
router.post('/sport-image',
    upload.single('sport_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const sport = await Sport.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var sport_image = today + '_' + req.file.originalname;
        } else {
            var sport_image = sport.sport_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/sportEdit', {
                title: 'Sport Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                sport: sport,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateSport = {
                sport_image: sport_image,
            };

            const upData = await Sport.updateOne({ _id: id }, updateSport);

            console.log('Sport Update :- ', upData);

            req.flash('success', 'sport update sucssesfuly...')
            res.location(`/dashboard/sport-edit?id=${id}`);
            res.redirect(`/dashboard/sport-edit?id=${id}`);
        }

    }
);
// sport-details page route
router.get('/sport-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/sport-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// sport-post-add

router.post('/sport-add', isAdmin,
    upload.single('sport_image'),
    body('sport_title', 'Title is required.').notEmpty(),
    body('sport_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let sport_title = req.body.sport_title;
        let sport_description = req.body.sport_description;
        let category = req.body.category;
        let sport_tag = req.body.sport_tag;
        let sport_seo_description = req.body.sport_seo_description;
        let sport_seo_keywords = req.body.sport_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var sport_image = today + '_' + req.file.originalname;
        } else {
            var sport_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/sports-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = sport_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const sports = await Sport.find({});
            for (var i = 0; i < sports.length; i++) {
                if (sports[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(sports[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Sport({
                slug: newSlug,
                sport_title: sport_title,
                sport_description: sport_description,
                category: category,
                sport_tag: sport_tag,
                sport_image: sport_image,
                category: category,
                author: req.user._id,
                sport_seo_description: sport_seo_description,
                sport_seo_keywords: sport_seo_keywords,
            });

            const addBanner = await new Sport(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/sport-details');
            res.redirect('/dashboard/sport-details');
        }

    }
);

// sport post edit
router.get('/sport-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const sport = await Sport.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/sportEdit', {
        title: 'Sport Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        sport: sport,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* sport update Router */
router.post('/sport-update', isAdmin,
    body('sport_title', 'Title is required.').notEmpty(),
    body('sport_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let sport_title = req.body.sport_title;
        let sport_description = req.body.sport_description;
        let category = req.body.category;
        let sport_tag = req.body.sport_tag;
        let sport_seo_description = req.body.sport_seo_description;
        let sport_seo_keywords = req.body.sport_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const sport = await Sport.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/sportEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                sport: sport,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const sport = await Sport.find({});
            for (var i = 0; i < sport.length; i++) {
                if (sport[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(sport[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateSport = {
                slug: newSlug,
                sport_title: sport_title,
                sport_description: sport_description,
                category: category,
                sport_tag: sport_tag,
                category: category,
                author: req.user._id,
                sport_seo_description: sport_seo_description,
                sport_seo_keywords: sport_seo_keywords,
            };

            const upData = await Sport.updateOne({ _id: id }, updateSport);

            console.log('sport Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/sport-edit?id=${id}`);
            res.redirect(`/dashboard/sport-edit?id=${id}`);
        }

    }
);

/* GET sport list page. */
router.get('/sport-list', isAdmin, async function (req, res, next) {
    const sports = await Sport.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let sportsList = [];

    sports.forEach(async (sport) => {
        sportsList.push({
            _id: sport._id,
            slug: sport.slug,
            sport_title: sport.sport_title,
            sport_description: sport.sport_description,
            category: `${catName(sport.category)}`,
            sport_tag: sport.sport_tag,
            sport_image: sport.sport_image,
            author: `${userName(sport.author)}`,
            sport_seo_description: sport.sport_seo_description,
            sport_seo_keywords: sport.sport_seo_keywords,
            view: sport.view,
            date_at: sport.date_at,
            __v: sport.__v
        })
    })

    res.render('dashboard/sportlist', {
        title: 'sport List | Admin Dashboard',
        baseUrl: base_url,
        sports: sportsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// sport-del
router.get('/sport-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Sport.deleteOne({ _id: id });
    console.log('Sport delete :- ', delData);
    res.send('Categories delete');
});


// Menu Category Politics Routes


/* politic image upload Router */
router.post('/politic-image',
    upload.single('politic_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const politic = await Politic.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var politic_image = today + '_' + req.file.originalname;
        } else {
            var politic_image = politic.politic_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/politicEdit', {
                title: 'Politic Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                politic: politic,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updatePolitic = {
                politic_image: politic_image,
            };

            const upData = await Politic.updateOne({ _id: id }, updatePolitic);

            console.log('Politic Update :- ', upData);

            req.flash('success', 'politic update sucssesfuly...')
            res.location(`/dashboard/politic-edit?id=${id}`);
            res.redirect(`/dashboard/politic-edit?id=${id}`);
        }

    }
);
// politic-details page route
router.get('/politic-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/politic-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// politic-post-add

router.post('/politic-add', isAdmin,
    upload.single('politic_image'),
    body('politic_title', 'Title is required.').notEmpty(),
    body('politic_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let politic_title = req.body.politic_title;
        let politic_description = req.body.politic_description;
        let category = req.body.category;
        let politic_tag = req.body.politic_tag;
        let politic_seo_description = req.body.politic_seo_description;
        let politic_seo_keywords = req.body.politic_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var politic_image = today + '_' + req.file.originalname;
        } else {
            var politic_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/politics-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = politic_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const politics = await Politic.find({});
            for (var i = 0; i < politics.length; i++) {
                if (politics[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(politics[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Politic({
                slug: newSlug,
                politic_title: politic_title,
                politic_description: politic_description,
                category: category,
                politic_tag: politic_tag,
                politic_image: politic_image,
                category: category,
                author: req.user._id,
                politic_seo_description: politic_seo_description,
                politic_seo_keywords: politic_seo_keywords,
            });

            const addBanner = await new Politic(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/politic-details');
            res.redirect('/dashboard/politic-details');
        }

    }
);

// politic post edit
router.get('/politic-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const politic = await Politic.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/politicEdit', {
        title: 'Politic Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        politic: politic,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* politic update Router */
router.post('/politic-update', isAdmin,
    body('politic_title', 'Title is required.').notEmpty(),
    body('politic_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let politic_title = req.body.politic_title;
        let politic_description = req.body.politic_description;
        let category = req.body.category;
        let politic_tag = req.body.politic_tag;
        let politic_seo_description = req.body.politic_seo_description;
        let politic_seo_keywords = req.body.politic_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const politic = await Politic.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/politicEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                politic: politic,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const politic = await Politic.find({});
            for (var i = 0; i < politic.length; i++) {
                if (politic[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(politic[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updatePolitic = {
                slug: newSlug,
                politic_title: politic_title,
                politic_description: politic_description,
                category: category,
                politic_tag: politic_tag,
                category: category,
                author: req.user._id,
                politic_seo_description: politic_seo_description,
                politic_seo_keywords: politic_seo_keywords,
            };

            const upData = await Politic.updateOne({ _id: id }, updatePolitic);

            console.log('politic Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/politic-edit?id=${id}`);
            res.redirect(`/dashboard/politic-edit?id=${id}`);
        }

    }
);

/* GET politic list page. */
router.get('/politic-list', isAdmin, async function (req, res, next) {
    const politics = await Politic.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let politicsList = [];

    politics.forEach(async (politic) => {
        politicsList.push({
            _id: politic._id,
            slug: politic.slug,
            politic_title: politic.politic_title,
            politic_description: politic.politic_description,
            category: `${catName(politic.category)}`,
            politic_tag: politic.politic_tag,
            politic_image: politic.politic_image,
            author: `${userName(politic.author)}`,
            politic_seo_description: politic.politic_seo_description,
            politic_seo_keywords: politic.politic_seo_keywords,
            view: politic.view,
            date_at: politic.date_at,
            __v: politic.__v
        })
    })

    res.render('dashboard/politiclist', {
        title: 'politic List | Admin Dashboard',
        baseUrl: base_url,
        politics: politicsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// politic-del
router.get('/politic-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Politic.deleteOne({ _id: id });
    console.log('Politic delete :- ', delData);
    res.send('Categories delete');
});


// Menu category Technology Routes


/* technology image upload Router */
router.post('/technology-image',
    upload.single('technology_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const technology = await Technology.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var technology_image = today + '_' + req.file.originalname;
        } else {
            var technology_image = technology.technology_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/technologyEdit', {
                title: 'Technology Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                technology: technology,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updateTechnology = {
                technology_image: technology_image,
            };

            const upData = await Technology.updateOne({ _id: id }, updateTechnology);

            console.log('Technology Update :- ', upData);

            req.flash('success', 'technology update sucssesfuly...')
            res.location(`/dashboard/technology-edit?id=${id}`);
            res.redirect(`/dashboard/technology-edit?id=${id}`);
        }

    }
);
// technology-details page route
router.get('/technology-details', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('dashboard/technology-details', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

// technology-post-add

router.post('/technology-add', isAdmin,
    upload.single('technology_image'),
    body('technology_title', 'Title is required.').notEmpty(),
    body('technology_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let technology_title = req.body.technology_title;
        let technology_description = req.body.technology_description;
        let category = req.body.category;
        let technology_tag = req.body.technology_tag;
        let technology_seo_description = req.body.technology_seo_description;
        let technology_seo_keywords = req.body.technology_seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var technology_image = today + '_' + req.file.originalname;
        } else {
            var technology_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('dashboard/technologys-details', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = technology_title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const technologys = await Technology.find({});
            for (var i = 0; i < technologys.length; i++) {
                if (technologys[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(technologys[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newBanner = new Technology({
                slug: newSlug,
                technology_title: technology_title,
                technology_description: technology_description,
                category: category,
                technology_tag: technology_tag,
                technology_image: technology_image,
                category: category,
                author: req.user._id,
                technology_seo_description: technology_seo_description,
                technology_seo_keywords: technology_seo_keywords,
            });

            const addBanner = await new Technology(newBanner).save()

            console.log('addBanner : ', addBanner);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/dashboard/technology-details');
            res.redirect('/dashboard/technology-details');
        }

    }
);

// technology post edit
router.get('/technology-edit', isAdmin, async function (req, res, next) {

    let bannerId = req.query.id;
    const technology = await Technology.findOne({ _id: bannerId });
    const categoryList = await Categories.find({});
    res.render('dashboard/technologyEdit', {
        title: 'Technology Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        technology: technology,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* technology update Router */
router.post('/technology-update', isAdmin,
    body('technology_title', 'Title is required.').notEmpty(),
    body('technology_description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.'),
    async function (req, res, next) {
        let id = req.body.id;
        let technology_title = req.body.technology_title;
        let technology_description = req.body.technology_description;
        let category = req.body.category;
        let technology_tag = req.body.technology_tag;
        let technology_seo_description = req.body.technology_seo_description;
        let technology_seo_keywords = req.body.technology_seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const technology = await Technology.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('dashboard/technologyEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                technology: technology,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const technology = await Technology.find({});
            for (var i = 0; i < technology.length; i++) {
                if (technology[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(technology[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updateTechnology = {
                slug: newSlug,
                technology_title: technology_title,
                technology_description: technology_description,
                category: category,
                technology_tag: technology_tag,
                category: category,
                author: req.user._id,
                technology_seo_description: technology_seo_description,
                technology_seo_keywords: technology_seo_keywords,
            };

            const upData = await Technology.updateOne({ _id: id }, updateTechnology);

            console.log('technology Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/dashboard/technology-edit?id=${id}`);
            res.redirect(`/dashboard/technology-edit?id=${id}`);
        }

    }
);

/* GET technology list page. */
router.get('/technology-list', isAdmin, async function (req, res, next) {
    const technologys = await Technology.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let technologysList = [];

    technologys.forEach(async (technology) => {
        technologysList.push({
            _id: technology._id,
            slug: technology.slug,
            technology_title: technology.technology_title,
            technology_description: technology.technology_description,
            category: `${catName(technology.category)}`,
            technology_tag: technology.technology_tag,
            technology_image: technology.technology_image,
            author: `${userName(technology.author)}`,
            technology_seo_description: technology.technology_seo_description,
            technology_seo_keywords: technology.technology_seo_keywords,
            view: technology.view,
            date_at: technology.date_at,
            __v: technology.__v
        })
    })

    res.render('dashboard/technologylist', {
        title: 'technology List | Admin Dashboard',
        baseUrl: base_url,
        technologys: technologysList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

// technology-del
router.get('/technology-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Technology.deleteOne({ _id: id });
    console.log('Technology delete :- ', delData);
    res.send('Categories delete');
});












module.exports = router;
