//adding new comments

//importing our 3rd party Packages and functions we need
const {Router} = require('express');
const { check , body } = require('express-validator/check');

const router = Router();

//importing our controller we define in "controllers folder
const authController = require('../controllers/auth');

//importing our mongo model we define in "modedls" folder
const User = require('../models/user');

// /login => GET
router.get('/login' , authController.getLogIn);
// /signup => GET
router.get('/signup' , authController.getSignUp);
// /logout => POST
router.post('/logout' , authController.postLogOut);
// /login => POST
router.post('/login' 
                , [
                    check('email')
                    .isEmail()
                    .withMessage('please enter a valid email')
                    .normalizeEmail()
                ,

                body(
                    'password' , 
                    'your password is not valid')
                    .isLength({min: 6})
                    .isAlphanumeric()
                    .trim()
                ] , 
                authController.postLogIn);
// /signup => POST
router.post('/signup' , 
            [
                check('email')
                    .isEmail()
                    .withMessage('please enter a valid email')
                    .custom(value => {
                        return User.findOne({email: value})
                                .then(userDoc => {
                                    if(userDoc){
                                        return Promise.reject('user already exists')
                                    }
                                })
                    })
                    .normalizeEmail()
                ,

                body(
                    'password' , 
                    'your password should be at least 6 characters , \nand contains only aplphabets and numbers')
                    .isLength({min: 6})
                    .isAlphanumeric()
                    .trim()
                     ,

                body('confirmPassword')
                    .trim()
                    .custom((value , {req}) =>{
                        if(value !== req.body.password){
                            throw new Error ('passwords have to match!')
                        }
                        return true
                    })
            ] , 
            authController.postSignUp);

module.exports = router;