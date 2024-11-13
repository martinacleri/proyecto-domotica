const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const eventRoute = require('./routes/eventRoute');
const classroomRoute = require('./routes/classroomRoute');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api/users', userRoute);
app.use('/api/events', eventRoute);
app.use('/api/classrooms', classroomRoute);

app.use((err, req, res, next) => {
    console.error('Error no capturado:',err);
    res.status(500).json({message: 'Ocurrió un error en el servidor.'})
})

module.exports = app;