//Mongodb Connection file
const mongoose = require('mongoose');
//GEt the config package
const config = require('config');
const router = require('../routes/api/user');


//Now to get URI we had put in the default.json. we will put in a variable db
const db = config.get('mongoURI'); //It will get us the desired value.

const connectDB = async () => {
	try{
     await mongoose.connect(db, {
     	useNewUrlParser: true,
     	useUnifiedTopology: true,
          useCreateIndex: true
     });

     console.log('Mongodb Connected');
	}
	catch(err) {
     console.log(err.message);
     //EXIT Process
     process.exit(1);
	}
}

//@route GEt api/profile
//desc get all profiles
//public

router.get('/', (req, res) => {
  
});

module.exports = connectDB;