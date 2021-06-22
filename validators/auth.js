const {check} = require('express-validator');

exports.userSignupValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must contain atleast 6 charecters long').matches(/\d/).withMessage("Password must contain a number"),
    check('about').not().isEmpty().withMessage('Mention something about the user'),
    check('mobile_no').not().isEmpty().withMessage('Mobile Number is mandatory').isLength({min:10 , max:11}).withMessage('Mobile No must be 11 charecters long'),
    check('address').not().isEmpty().withMessage('Address is mandatory.').isLength({max: 25}).withMessage('Address must be 30 charecters long'),
]

exports.userSigninValidator = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must contain atleast 6 charecters long').matches(/\d/).withMessage("Password must contain a number")
]


exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];