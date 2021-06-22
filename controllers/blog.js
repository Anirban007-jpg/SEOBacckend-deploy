const Blog = require('../models/blog');
const Tag = require('../models/tag');
const Category = require('../models/category');
const f = require('formidable');
const fs = require('fs');
const s = require('slugify');
const sh = require('string-strip-html');
const _ = require('lodash');
const { smartTrim } = require('../helpers/blog');


exports.create = (req,res) => {
    let form = new f.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err){
            return res.status(400).json({
                error: 'Image could not uploaded'
            })
        }

     
         
        const {title, body, categories, tags} = fields;

        if (!title || !title.length){
            return res.status(400).json({
                error: 'title is required'
            })
        }

        if (!body || body.length < 200){
            return res.status(400).json({
                error: 'Content is too short'
            })
        }

        if (!categories || categories.length === 0){
            return res.status(400).json({
                error:  'At least one category is required'
            })
        }

        if (!tags || tags.length === 0){
            return res.status(400).json({
                error:  'At least one tag is required'
            })
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 150, ' ', ' ...');
        blog.slug = s(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`
        blog.mdescription = sh(body.substring(0,160));
        blog.postedBy = req.auth._id
        blog.createdAt = Date.now();
        // categories and tags
        let arrayofCategories = categories && categories.split(',')
        let arrayofTags = tags && tags.split(',')
        if (files.photo){
            if (files.photo.size > 10000000){
                return res.status(400).json({
                    error: 'Image should be less than 1Mb in size'
                })
            }
            blog.photo.data = fs.readFileSync(files.photo.path)
            blog.photo.contentType = files.photo.type
        }
        blog.save((err,result) => {
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id, {$push: {categories: arrayofCategories}}, {new:true}).exec((err,result) => {
                if (err){
                    return res.status(400).json({
                        error: err
                    })
                }else{
                    Blog.findByIdAndUpdate(result._id, {$push: {tags: arrayofTags}}, {new:true}).exec((err,result) => {
                        if (err){
                            return res.status(400).json({
                                error: err
                            }) 
                        }else{
                            res.json(result);
                        }
                    })
                }
                
            })
        })

    })
}

exports.createBlog = (req,res) => {
    let form = new f.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err){
            return res.status(400).json({
                error: 'Image could not uploaded'
            })
        }

     
         
        const {title, body, categories, tags} = fields;

        if (!title || !title.length){
            return res.status(400).json({
                error: 'title is required'
            })
        }

        if (!body || body.length < 200){
            return res.status(400).json({
                error: 'Content is too short'
            })
        }

        if (!categories || categories.length === 0){
            return res.status(400).json({
                error:  'At least one category is required'
            })
        }

        if (!tags || tags.length === 0){
            return res.status(400).json({
                error:  'At least one tag is required'
            })
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 150, ' ', ' ...');
        blog.slug = s(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`
        blog.mdescription = sh(body.substring(0,160));
        blog.postedBy = req.auth._id
        blog.createdAt = Date.now();
        // categories and tags
        let arrayofCategories = categories && categories.split(',')
        let arrayofTags = tags && tags.split(',')
        if (files.photo){
            if (files.photo.size > 10000000){
                return res.status(400).json({
                    error: 'Image should be less than 1Mb in size'
                })
            }
            blog.photo.data = fs.readFileSync(files.photo.path)
            blog.photo.contentType = files.photo.type
        }
        blog.save((err,result) => {
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id, {$push: {categories: arrayofCategories}}, {new:true}).exec((err,result) => {
                if (err){
                    return res.status(400).json({
                        error: err
                    })
                }else{
                    Blog.findByIdAndUpdate(result._id, {$push: {tags: arrayofTags}}, {new:true}).exec((err,result) => {
                        if (err){
                            return res.status(400).json({
                                error: err
                            }) 
                        }else{
                            res.json(result);
                        }
                    })
                }
                
            })
        })

    })
}



exports.listBlogs = (req,res,next) => {
    Blog.find({})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username')
    .select('_id title slug excerpt categories tags createdAt updatedAt postedBy')
    .exec((err,data) => { 
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            res.json(data);
        }
    )
};

exports.listBlogswithcatandtag = (req,res,next) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;


    let blogs
    let categories
    let tags

    Blog.find({})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username')
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags createdAt updatedAt postedBy')
    .exec((err, data) => {
        if (err){
            return res.status(400).json({
                error: err
            })
        }
        blogs = data;
        // get all categories
        Category.find({}).exec((err, c) => {
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            categories = c;
            //get all tags
            Tag.find({}).exec((err, t) => {
                if (err){
                    return res.status(400).json({
                        error: err
                    })
                }
                tags = t;
                // return all blogs categories and tags
                res.json({blogs, categories, tags, size: blogs.length});
            })
        })
    })
}

exports.readBlog = (req,res,next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username')
    .select('_id title slug excerpt categories mtitle mdescription tags body createdAt updatedAt postedBy')
    .exec((err,data) => { 
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            res.json(data);
        }
    )
}

exports.removeblog = (req,res,next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove({slug}).exec((err,data) => {
        if (err){
            return res.status(400).json({
                error: err
            })
        }

        res.json(`Post with title ${data.title} deleted successfully`);
    })
}


exports.updateblog = (req,res,next) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({slug}).exec((err, oldBlog) => {
        if (err){
            return res.status(400).json({
                error: 'Blog could not be found'
            })
        }
     
        let form = new f.IncomingForm();
     
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
            if (err){
                return res.status(400).json({
                    error: 'Image could not uploaded'
                })
            }
    
         
             
            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;
            oldBlog.updatedAt = Date.now();

            const {body,categories,tags} = fields;
    
       
            if (body){
                oldBlog.excerpt = smartTrim(body, 200, ' ', ' ....');
                oldBlog.mdescription = sh(body.substring(0,160));         
            }
    
            
            if (categories){
                oldBlog.categories = categories.split(',')         
            }

            
            if (tags){
                oldBlog.tags = tags.split(',')         
            }

            if (files.photo){
                if (files.photo.size > 10000000){
                    return res.status(400).json({
                        error: 'Image should be less than 1Mb in size'
                    })
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path)
                oldBlog.photo.contentType = files.photo.type
            }
            
            oldBlog.save((err,result) => {
                if (err){
                    return res.status(400).json({
                        error: err
                    })
                }
                // result.photo = undefined;
                res.json(result);
            })    
    
        })
    })

  
}

exports.Blogphoto = (req,res) => {
    const slug =req.params.slug.toLowerCase();
    Blog.findOne({slug})
    .select('photo')
    .exec((err,blog) => {
        if(err || !blog){
            return res.status(400).json({
                error: 'Required blog not found'
            })
        }
        res.set('Content-Type', blog.photo.contentType)
        return res.send(blog.photo.data);
    })
}

exports.listRelatedBlogs = (req,res) => {
    let lim = req.body.limit ? parseInt(req.body.limit) : 3;  
    const {_id, categories} = req.body.blog;

    Blog.find({_id: {$ne: _id}, categories: {$in: categories}})
    .limit(lim)
    .populate('postedBy','_id name username')
    .select('_id title slug excerpt categories mtitle mdescription tags body createdAt updatedAt postedBy')
    .exec((err, data) => {
        if (err){
            return res.status(400).json({
                error: 'Blogs not found'
            })
        }
        res.json(data);
    })
}

exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Blog.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
            },
            (err, blogs) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                }
                res.json(blogs);
            }
        ).select('-photo -body');
    }
};