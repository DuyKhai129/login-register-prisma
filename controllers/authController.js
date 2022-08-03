const createError = require("http-errors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");
const prisma = new PrismaClient();
const authController = {
  //register
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const checkUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          email: true,
        },
      });
      if (checkUser) {
        return res.status(200).json({
          status: "fail",
          message: "Username already exists!",
          Response: checkUser,
        });
      }
      console.log(checkUser);

      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashed,
        },
        //lỗi clientVersion": "4.1.0
        // email: email,
        // name: name,
        // password: hashed,
      });
      res.status(200).json({
        status: "success",
        message: "Create Account Success!",
        Response: newUser,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(200).json({
          status: "fail",
          message: "Email address is incorrect!",
          Response: null,
        });
      }
      const checkPassword = bcrypt.compareSync(password, user.password);
      console.log("check pass ", checkPassword);
      if (!checkPassword) {
        return res.status(200).json({
          status: "fail",
          message: "password not valid!",
          Response: null,
        });
      }
      const accessToken = await jwt.signAccessToken(user);
      console.log(accessToken);
      res.status(200).json({
        status: true,
        message: "Account login successful",
        Response: { user },
      });
    } catch (err) {
      next(err);
    }
  },
  //get all user
  all: async (req, res, next) => {
    try {
      const allUsers = await prisma.user.findMany();
      res.status(200).json({
        status: true,
        messenger: "success",
        Response: allUsers,
      });
      console.log(allUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
module.exports = authController;
