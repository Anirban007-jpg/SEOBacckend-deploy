const express = require('express');
const cron = require('node-cron');
const morgan = require('morgan');
const bp = require('body-parser');
const cp = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
// check
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}



// bring in routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const blogRoutes = require('./routes/blog');
const formRoutes = require('./routes/form');

// app
const app = express();

// db
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true}).then(() => console.log('DB connected'));

// middlewares
app.use(morgan())
app.use(express.json())
app.use(cp())

cron.schedule('*/5 * * * *', () => {
  console.log('running a task every two minutes');
});

//cors
app.use(cors());    



// routes

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', blogRoutes);
app.use('/api', formRoutes);
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError'){
        res.status(401).json({
            error: "Unauthorized!"
        });
    }
});
// middlewares

// apiDocs
app.get('/', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
})

// app.get('/', (req,res) => {
//     fs.readFile('apiDocs/docs.json', (err, data) => {
//         if (err) {
//             res.status(400).json({
//                 error: err
//             })
//         }

//         const docs = JSON.parse(data);
//         res.json(docs);
//     })
// })


// handle port
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0' , function(err) {
    console.log(`Server is running }`)
})

