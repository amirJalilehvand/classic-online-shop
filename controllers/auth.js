const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

exports.getLogIn = (req , res , next) => {
    
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login' ,
        errorMessage: '',
        isAuthenticated : false,
        oldInput : {
            email: '' ,
            password: ''
        } ,
        validationError : []
      });
}

exports.postLogIn = (req , res , next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login' ,
            errorMessage: errors.array()[0].msg,
            isAuthenticated : false,
            oldInput : {
                email: email ,
                password: password
            } , 
            validationError : errors.array()
        });
    }  

    User.findOne({email: email})
    .then(user => {
        if(!user){
            return res.status(422).render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login' ,
                        errorMessage: 'invalid email or password',
                        isAuthenticated : false,
                        oldInput : {
                            email: email ,
                            password: password
                        } , 
                        validationError : [{param: 'both'}]
                    });
        }
        bcrypt.compare(password , user.password)
            .then(doMatch=> {
                if(!doMatch){
                    return res.status(422).render('auth/login', {
                                pageTitle: 'Login',
                                path: '/login' ,
                                errorMessage: 'invalid email or password',
                                isAuthenticated : false,
                                oldInput : {
                                    email: email ,
                                    password: password
                                } , 
                                validationError : [{param: 'both'}]
                            });
                }
                req.session.isLoggedIn = true
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/')
                })
            })
            .catch(err =>{
                console.log(err);
                res.redirect('/login')
            })
    })
    .catch(err => {
      const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
    });
}


exports.getSignUp = (req , res , next) => {
    let message = req.flash('error_signup');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null
    }
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup ',
        isAuthenticated : false,
        errorMessage: message,
        oldInput: {
            email:'',
            password: '',
            confirmPassword: ''
        },
        validationError: []
      });
}

exports.postSignUp = (req , res , next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            path: '/signup ',
            isAuthenticated : false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationError: errors.array()
          })
    }   
                bcrypt.hash(password , 12 )
                    .then(hashedPassword => {
                        const user = new User({
                            email: email,
                            password: hashedPassword,
                            cart: { items: [] }
                        })
                        return user.save();
                    })
                    .then(result => {
                        res.redirect('/login');
                    })
                    .catch(err => {
                        const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
                    });
                }

exports.postLogOut = (req , res , next) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
        }
        res.redirect('/');
    })
}