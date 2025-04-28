const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET='RKisagoodboy';

//Route1: Create a user by using: POST. Path is /api/auth/createuser. Login is not required
router.post('/createuser',
  [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
  ],
  async (req, res) => {
    let success= false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      // Check whether the user with that email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({success, error: "A user with this email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data={
        user:{
          id:user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);
      success= true;
      res.json({success,authtoken});
  
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal server error', error });
    }
  }
);

//Route2: Authenticate a User: POST "/api/auth/login" no login required
router.post('/login',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').exists().withMessage('password cannot be blank')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const{email,password}=req.body;
    try{
let user =await User.findOne({email});
if(!user){
  return res.status(400).json({error:"please try to login with correct credentials"});
}
const passwordCompare =await  bcrypt.compare(password,user.password);
if(!passwordCompare)
{
  let success= false;
   return res.status(400).json({success,error:"please try to login with correct credentials"});
}
const data={
  user:{
    id:user.id
  }
}
const authtoken = jwt.sign(data,JWT_SECRET);
success=true;
res.send({success,authtoken});
    }
    catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal server error', error });
    }
  })




  //Route3:Get loggedin User Details : POST "/api/auth/getuser" Login required

  router.post('/getuser',fetchuser,async (req, res) => {
    try{
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
}
catch (error) {
  console.error(error);
  res.status(500).send({ message: 'Internal server error', error });
}
});

module.exports = router;
