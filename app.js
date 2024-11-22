var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
import projectRoutes from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/tasks', taskRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
import projectRoutes from './routes/projectRoutes.js';
app.use('/projects', projectRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Database Connection Failed', err));
module.exports = app;
