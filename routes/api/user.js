const express = require('express');
const gravatar = require('gravatar');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User')
const config = require('config');
//@route  POST api/users
//@desc   Register user
//@access Public(Public means you do not need any auth to access it).
router.post('/',[
	check('name', 'Name is required')
	.not()
	.isEmpty(),
	check('email', 'Please include a valid Email').isEmail(),
	check(
	'password', 
	'password length must be 6'
	).isLength({min: 6})
	],
	async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
    	return res.status(400).json({errors: errors.array()});
    }
    
    const {name, email, password} = req.body;

    try{
	     //see if the user exists
	     let user = await User.findOne({email});

	     if(user) {
	     	return res.status(400).json({errors: [{msg: 'User already exists'}] });
	     }

	    //Get the user gravatar
	    const avatar = gravatar.url(email, {
	    	s: '200',
	    	r: 'pg',
	    	d: 'mm'
	    })

	    //Create a instance
	    user = new User({
	    	name, 
	    	email,
	    	avatar,
	    	password
	    })

	    //Encrypt password using bcrypt
	    const salt = await bcrypt.genSalt(10);
        
        user.password = await bcrypt.hash(password, salt);

        await user.save();

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