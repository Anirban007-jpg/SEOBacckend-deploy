const Tag = require('../models/tag');
const s = require('slugify');
const Blog = require('../models/blog');

exports.create = (req,res) => {

    const {name} = req.body;
    let slug = s(name).toLowerCase();
    
    Tag.findOne({slug : slug}).exec((err,tag) => {
        if (tag){
            return res.status(400).json({
                error: "Tag already exsits!"
            })
        }
    
        
        let t = new Tag({name, slug});
        
        t.save((err, data) => {
            if (err){
                return res.status(400).json({
                    error: err
                })
            }

            res.json(data);

        })
    })
}

exports.list = (req,res) => {
    Tag.find({}).exec((err, data) => {
        if (err) {
                return res.status(400).json({
                    error: err
                })
        }

        res.json(data);
    })
}


exports.read = (req,res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({slug: slug}).exec((err,tag) => {
        if (err || !tag) {
            return res.status(400).json({
                error: "Such Tag does not exsists"
            })
        }

        // res.json(tag);
        Blog.find({tags: tag})
        .populate('tags', '_id name slug')
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            res.json({tags: tag,blogs:data})
        })
    })
}


exports.Delete = (req,res) => {
    const slug = req.params.slug.toLowerCase();
    Tag.findOneAndRemove({slug: slug}).exec((err,tag) => {
        if (err || !tag) {
            return res.status(400).json({
                error: "Such Tag does not exsists and thus cannot be deleted!!"
            })
        }

        res.json({
            message: "Tag deleted successfully"
        });
    })
}