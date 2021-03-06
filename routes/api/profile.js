const express = require('express');
var router = express.Router();
const config = require('config');
const request = require('request');
const axios = require('axios');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');


router.get('/me',auth, async (req, res) => {
	try {
      const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);

      if(!profile) {
      	return res.status(400).json({msg: 'There is no profile of this user'});
      }

      res.json(profile);	
	}
	catch(err) {
		console.error(err.message);

	}
});

//@route  POSt api/profile
//@desc   Get current user profiles
//@access  Private

router.post('/', [auth, 
	[
       check('status', 'Status is required').not().isEmpty(),
       check('skills', 'Skills is required').not().isEmpty()
	]
    ],
	async (req, res) => {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		//Build Profile
	    const profileFields = {};
        profileFields.user = req.user.id;
         profileFields.user = req.user.id;
	    //if (handle) profileFields.handle = handle;
	    if (company) profileFields.company = company;
	    if (website) profileFields.website = website;
	    if (location) profileFields.location = location;
	    if (bio) profileFields.bio = bio;
	    if (status) profileFields.status = status;
	    if (githubusername)
	      profileFields.githubusername = githubusername;
	    // Skills - Spilt into array
	    if (skills) {
	      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
	    // Social
	    profileFields.social = {};
	    if (youtube) profileFields.social.youtube = youtube;
	    if (twitter) profileFields.social.twitter = twitter;
	    if (facebook) profileFields.social.facebook = facebook;
	    if (linkedin) profileFields.social.linkedin =linkedin;
	    if (instagram) profileFields.social.instagram = instagram;

	    try{
           let profile = await Profile.findOne({user: req.user.id});

           if(profile) {
           	//update
           	profile = await Profile.findOneAndUpdate(
               {user: req.user.id},
               {$set: profileFields},
               {new: true}
           		);

           	return res.json(profile);
           }

           //Create

           profile = new Profile(profileFields);

           await profile.save();
           res.json(profile);
	    }catch(err) {
	    	console.error(err.mesaage);
	    	res.status(500).send('Server Error');
	    	//console.log("hello");
	    }
});

//@route  GEt api/profile
//@desc   Get current user profiles
//@access  Public

router.get('/', async (req, res) => {
     try{
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	 }catch(err) {
		 console.error(err.message);
		 res.status(500).send('Server Error');
	 }
});

//@route  GEt api/profile/user/:user_id
//@desc   Get profile by user id
//@access  Public

router.get('/user/:user_id', async (req, res) => {
	try{ 
	   const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

	   if(!profile) return res.status(400).json({msg: 'Profile not found'});

	   res.json(profile);
	}catch(err) {
		console.error(err.message);
		if(err.kind == 'ObjectId') {
			res.status(400).json({msg: 'Profile not found'});
		}
		res.status(500).send('Server Error');
	}
});

//@route  delete api/profile
//@desc   delete user and user profiles
//@access  Private

router.delete('/', auth,  async (req, res) => {
	try{
		//todo- delete the posts.
		//Remove Profile
	   await Profile.findOneAndRemove({user: req.user.id});
	   //Remove user
	   await User.findOneAndRemove({ _id: req.user.id});

	   res.json({msg: 'Account Deleted. See you soon'});
	}catch(err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
	'/experience',
	
	auth,
	
	check('title', 'Title is required').notEmpty(),
	check('company', 'Company is required').notEmpty(),
	check('from', 'From date is required and needs to be from the past')
	  .notEmpty()
	  .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
	async (req, res) => {
	  const errors = validationResult(req);
	  if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	  }
       const {
		   title,
		   company,
		   location,
		   from,
		   to,
		   current,
		   description
	   } = req.body;

	   const newexep = {
		   title,
		   company,
		   location,
		   from,
		   to,
		   current,
		   description
	   }
	  try {
		const profile = await Profile.findOne({ user: req.user.id });
  
		profile.experience.unshift(newexep);
  
		await profile.save();
  
		res.json(profile);
	  } catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	  }
	}
  );

  // @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
	  const foundProfile = await Profile.findOne({ user: req.user.id });
  
	  foundProfile.experience = foundProfile.experience.filter(
		(exp) => exp._id.toString() !== req.params.exp_id
	  );
  
	  await foundProfile.save();
	  return res.status(200).json(foundProfile);
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ msg: 'Server error' });
	}
  });

  // @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
	'/education',
	auth,
	check('school', 'School is required').notEmpty(),
	check('degree', 'Degree is required').notEmpty(),
	check('fieldofstudy', 'Field of study is required').notEmpty(),
	check('from', 'From date is required and needs to be from the past')
	  .notEmpty()
	  .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
	async (req, res) => {
	  const errors = validationResult(req);
	  if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	  }
  
	  try {
		const profile = await Profile.findOne({ user: req.user.id });
  
		profile.education.unshift(req.body);
  
		await profile.save();
  
		res.json(profile);
	  } catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	  }
	}
  );
  
// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
	  const foundProfile = await Profile.findOne({ user: req.user.id });
	  foundProfile.education = foundProfile.education.filter(
		(edu) => edu._id.toString() !== req.params.edu_id
	  );
	  await foundProfile.save();
	  return res.status(200).json(foundProfile);
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ msg: 'Server error' });
	}
  });

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
	try {
	  const options = {
		  uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(
			  'githubClientId'
		  )}&client_request=${config.get('githubSecret')}`,
		  method: 'GET',
		  headers: {'user-agent': 'node.js'}
	  };
  
	  request(options, (error, response, body) =>  {
	   if(error) console.error(error);
	   
	   if(response.statusCode !== 200 ) {
		   return res.status(404).json({msg: 'No Github profile found'});
	   }
	   res.json(JSON.parse(body));
	  });
	} catch (err) {
	  console.error(err.message);
	  return res.status(404).json({ msg: 'No Github profile found' });
	}
  })


module.exports = router;