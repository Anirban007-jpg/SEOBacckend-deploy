const mongoose = require('mongoose');


const tagSchema = new mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String, 
        index: true,
        unique: true
    },
}, {timestamp : true} 
);
    
    
module.exports = mongoose.model('Tag', tagSchema);