const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('Register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'You must supply a valid email!').isEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req
    .checkBody('password-confirm', 'Confirm password cannot be blank')
    .notEmpty();
  req
    .checkBody('password-confirm', 'Your passwords do not match')
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next(); // no errors
};

exports.register = async (req, res, next) => {
  const user = await new User({
    email: req.body.email,
    name: req.body.name,
  });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  res.send('nice');
  next();
};
