const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connect Database
connectDB();

app.get('/', (req, res) => res.send('API Running'));

//Body-Parser
app.use(express.json({extended : false})); 

//Define Routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


//PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`We are up ${PORT}`));