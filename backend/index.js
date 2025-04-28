const connectToMongo = require('./db');
const express= require('express');
const auth =require('./routes/auth');
const notes = require('./routes/notes');
var cors = require('cors');
var app = express();
app.use(cors());


connectToMongo();
const port = 5000;

app.use(express.json());

//Available routes

app.use('/api/auth',auth)
app.use('/api/notes',notes)
app.listen(port,()=>
{ 
    console.log(`iNotebook backend listening at http://localhost: ${port}`)
})
