const User = require('../models/user');
const fo = require('formidable');
const fs = require('fs');
const sid = require('shortid');
const jwt = require('jsonwebtoken');
const ejwt = require('express-jwt');
const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const nm = require('nodemailer');
require('dotenv').config()
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');


exports.preSignup = (req, res) => {

  let username = sid.generate();
  let profile = `${process.env.CLIENT_URL}/profile/${username}`;
  const { name,email,about,address,mobile_no,password,role } = req.body;
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (user) {
          return res.status(400).json({
              error: 'Email is taken'
          });
      }
      const token = jwt.sign({name,email,about,address,mobile_no,password,username,profile,role }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

      let transporter = nm.createTransport({
        port: 465,
        service: "gmail",
        auth: {
            user: 'abanerjee763@gmail.com',
            pass: '03432582357',
        },
        secure: false
    
      })

      var message = {
          from: 'abanerjee763@gmail.com',
          to: email,
          subject: `Account activation link`,
          html: `
          <p>Please use the following link to activate your acccount:</p>
          <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>https://seoblog.com</p>
      `
      };

      transporter.sendMail(message, (err,success) => {
        if(err){
            console.log(err);
            res.status(400).json({
                error: err
            });
            
        }

        res.status(200).json({
           message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
        })
    })

  
  });
};


exports.signup = (req,res) => {
    User.findOne({email: req.body.email}).exec((err,user) => {
      if (user){
        return res.status(400).json({
          error: "User already exsists"
        })
      }
    })

      const {name,email,about,address,mobile_no,password,role} = req.body;
      let username = sid.generate();
      let profile = `${process.env.CLIENT_URL}/profile/${username}`;

      let newUser = new User({name,email,about,address,mobile_no,password,username,profile,role});
      newUser.save((err, success) => {
        if (err){
          return res.status(400).json({
            error: err
          })
        }

        res.json({
          message: "Signup Success! Please Signin"
        });
      });
    })

    //    const token = req.body.token;
    // if (token) {
    //     jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
    //         if (err) {
    //             return res.status(401).json({
    //                 error: 'Expired link. Signup again'
    //             });
    //         }

    //         const {name, email, password, profile, username, about, address, mobile_no, role} = jwt.decode(token);

    //         let username = shortId.generate();
    //         let profile = `${process.env.CLIENT_URL}/profile/${username}`;

    //         const user = new User({ name, email, password, profile, username, about, address, mobile_no, role });
    //         user.save((err, user) => {
    //             if (err) {
    //                 return res.status(401).json({
    //                     error: err
    //                 });
    //             }
    //             return res.json({
    //                 message: 'Singup success! Please signin'
    //             });
    //         });
    //     });
    // } else {
    //     return res.json({
    //         message: 'Something went wrong. Try again'
    //     });
    // }
}

exports.signin = (req,res) => {
    
    const {email,password} = req.body;
    // check if user exsists
    User.findOne({email}).exec((err,user) => {
      if (err || !user){
        return res.status(400).json({
          error: "User with this email does not exsist in Database"
        });
      }
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Password does not match"
        });
      }

      // generate a jsonweb token and send it to client
      const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

      res.cookie('token', token, {expiresIn: '1d'});

      const {_id,name,email,about,address,mobile_no,username,role} = user;
      return res.json({
        token,
        user : {_id,name,email,about,address,mobile_no,username,role}
      });
    })
}

exports.signout = (req,res) => {
  res.clearCookie("token")
  res.json({
    message: 'Signout Success'
  })
}

exports.requireSignin = ejwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // added later
  userProperty: "auth"
});

exports.authMiddleware = (req,res,next) => {
   const authUserId = req.auth._id;
   User.findById({_id: authUserId}).exec((err,user) => {
     if (err || !user){
      return res.status(400).json({
        error: "User already exsists"
      })
     }

     req.profile = user;
     next();
   })
}

exports.customerMiddleware = (req,res,next) => {
  const authUserId = req.auth._id;
  User.findById({_id: authUserId}).exec((err,user) => {
    if (err || !user){
     return res.status(400).json({
       error: "User already exsists"
     })
    }

    if (user.role !== 0 || user.role === 1 || user.role === 2){
      return res.status(400).json({
        error: "Customer Resource ! Access Denied"
      })
    }

    req.profile = user;
    next();
  })
  
}

exports.adminMiddleware = (req,res,next) => {
  const adminUserId = req.auth._id;
  User.findById({_id: adminUserId}).exec((err,user) => {
    if (err || !user){
     return res.status(400).json({
       error: "User already exsists"
     })
    }
    if (user.role !== 1 || user.role === 0 || user.role === 2){
      return res.status(400).json({
        error: "Admin Resource ! Access Denied"
      })
    }

    req.profile = user;
    next();
  })
}

exports.superadminMiddleware = (req,res,next) => {
  const superadminUserId = req.auth._id;
  User.findById({_id: superadminUserId}).exec((err,user) => {
    if (err || !user){
     return res.status(400).json({
       error: "User already exsists"
     })
    }
    if (user.role !== 2 || user.role === 1 || user.role === 0){
      return res.status(400).json({
        error: "Super Admin Resource ! Access Denied"
      })
    }

    req.profile = user;
    next();
  })
}

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
      if (err || !user) {
          return res.status(401).json({
              error: 'User with that email does not exist'
          });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

      let transporter = nm.createTransport({
        port: 465,
        service: "gmail",
        auth: {
            user: 'abanerjee763@gmail.com',
            pass: '03432582357',
        },
        secure: false
    
        })
      // email
      
      var message = {
          from: 'abanerjee763@gmail.com',
          to: email,
          subject: `Password reset link`,
          html: `
          <p>Please use the following link to reset your password:</p>
          <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>https://seoblog.com</p>
      `
      };
      // populating the db > user > resetPasswordLink
      return user.updateOne({ resetPasswordLink: token }, (err, success) => {
          if (err) {
              return res.json({ error: err });
          } else {
            transporter.sendMail(message, (err,success) => {
              if(err){
                  console.log(err);
                  res.status(400).json({
                      error: err
                  });
                  
              }
      
              res.status(200).json({
                  message: "password reset link sent succesfully!"
              })
                })
          }
      });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
          if (err) {
              return res.status(401).json({
                  error: 'Expired link. Try again'
              });
          }
          User.findOne({ resetPasswordLink }, (err, user) => {
              if (err || !user) {
                  return res.status(401).json({
                      error: 'Something went wrong. Try later'
                  });
              }
              const updatedFields = {
                  password: newPassword,
                  resetPasswordLink: ''
              };

              user = _.extend(user, updatedFields);

              user.save((err, result) => {
                  if (err) {
                      return res.status(400).json({
                          error: err
                      });
                  }
                  res.json({
                      message: `Great! Now you can login with your new password`
                  });
              });
          });
      });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        // console.log(response)
        const { email_verified, name, email, jti } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    // console.log(user)
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.cookie('token', token, { expiresIn: '1d' });
                    const { _id, email, name, role, username } = user;
                    return res.json({ token, user: { _id, email, name, role, username } });
                } else {
                    let username = sid.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti;
                    user = new User({ name, email, profile, username, password });
                    user.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.cookie('token', token, { expiresIn: '1d' });
                        const { _id, email, name, role, username } = data;
                        return res.json({ token, user: { _id, email, name, role, username } });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again.'
            });
        }
    });
};
