const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        index: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    body: {
        type: {}
    },
    excerpt: {
        type: String
    },
    mtitle: {
        type: String,
    },
    mdescription: {
        type: String,
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    categories: [{type:ObjectId, ref: 'Category', required: true}],
    tags: [{type:ObjectId, ref: 'Tag', required: true}],
    postedBy : {
        type:ObjectId, 
        ref: 'User', 
        required: true
    },
    createdAt : {type: Date},
    updatedAt : {type: Date}
})


module.exports = mongoose.model('Blog', blogSchema);