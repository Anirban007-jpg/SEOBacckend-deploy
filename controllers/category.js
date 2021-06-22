const category = require('../models/category');
const Blog = require('../models/blog');
const s = require('slugify');

exports.create = (req,res) => {

    const {name} = req.body;
    let slug = s(name).toLowerCase();
    
    category.findOne({slug : slug}).exec((err,cat) => {
        if (cat){
            return res.status(400).json({
                error: "Category already exsits!"
            })
        }
    
        
        let Category = new category({name, slug});
        
        Category.save((err, data) => {
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
    category.find({}).exec((err, data) => {
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

    category.findOne({slug: slug}).exec((err,cat) => {
        if (err || !cat) {
            return res.status(400).json({
                error: "Such Category does not exsists"
            })
        }

        // res.json(cat);
        Blog.find({categories: cat})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            res.json({category: cat,blogs:data})
        })
    })


}


exports.Delete = (req,res) => {
    const slug = req.params.slug.toLowerCase();
    category.findOneAndRemove({slug: slug}).exec((err,cat) => {
        if (err || !cat) {
            return res.status(400).json({
                error: "Such Category does not exsists and thus cannot be deleted!!"
            })
        }

        res.json({
            message: `${cat.name} deleted successfully`
        });
    })
}