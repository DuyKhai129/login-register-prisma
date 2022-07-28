const router = require('express').Router();
const user = require('../controllers/authController');
const auth = require('../middleWares/auth');
// register
router.post('/signIn', user.register);

// login
router.post('/login', user.login);

// all users
router.get('/', auth, user.all);

module.exports = router;