const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const config = require('config');

//@route  GET api/auth
//@desc   TEST route
//@access Public(Public means you do not need any auth to access it).
router.get('/', auth, async (req, res) => {

	try{
     const user = await User.findById(req.user.id).select('-password');
     res.json(user);
	}catch(err){
		console.error(err.message);
        res.status(500).send('Server Error');
	}
});


router.post('/',[
	check('email', 'Please include a valid Email').isEmail(),
	check(
	'password', 
	'password is required'
	).exists()
	],
	async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
    	return res.status(400).json({errors: errors.array()});
    }
    
    const {email, password} = req.body;

    try{
	     //see if the user exists
	     let user = await User.findOne({email});

	     if(!user) {
	     	return res.status(400).json({errors: [{msg: 'Invalid credentials'}] });
	     }

	    const imatch = await bcrypt.compare(password, user.password);

	    if(!imatch) { 
	    	return res
	    	.status(400)
	    	.json({errors: [{msg: 'Invalid credentials'}]});
	    }

	    //Return json token to immediately login them after registering
	    //Creating payload
	    const payload = {
	    	user: {
	    		id: user.id  //MongoDb's id
	    	}
	    };

	    jwt.sign(payload, 
         config.get('jwtSecret'),
         {expiresIn: 360000},
         (err, token) => {
          if(err) throw err;
          res.json({token});
         });
    }
    catch(err) {
    	console.error(err.message);
    	res.status(500).send('Server error');
    }
    

 
});

module.exports = router;