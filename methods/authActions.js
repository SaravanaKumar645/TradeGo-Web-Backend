const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const utils = require("./utils");
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const nodeMailer = require("nodemailer");

//nodemailer config
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.NM_MAIL_ID,
    pass: process.env.NM_MAIL_PASS,
    clientId: process.env.NM_CLIENT_ID,
    clientSecret: process.env.NM_CLIENT_SECRET,
    refreshToken: process.env.NM_REFRRESH_TOKEN,
  },
});

var functions = {
  Home: async (req, res) => {
    res.send({ msg: "Hello there he !", success: true });
  },
  RegisterUser: async (req, res) => {
    const { name, email, password, mobile } = req.body;
    await User.findOne({ email: email }, async (err, user) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ success: false, msg: "Something went wrong ! Try again ." });
      }
      if (user) {
        console.log(user);
        res.code(202);
        return res.send({
          success: false,
          msg: "User already exists ! Try with different email",
        });
      }
      const newUser = User({
        name: name,
        email: email,
        password: password,
        mobileNumber: mobile,
      });
      await newUser.save(async function (err, newUser) {
        if (err || !newUser) {
          console.log(err);
          res.status(400).send({
            success: false,
            msg: "Something went wrong ! Try again .",
          });
        }
        if (newUser) {
          console.log(newUser);
          var mailOpt = {
            from: "admin@tradego.com",
            to: newUser.email,
            subject: "Your Sign up was successful",
            html: `<center>
                    <div class="emailbox" style="width: auto; padding: 40px; height: auto; border-radius: 10px; border: 3px outset rgb(36, 105, 253); display: list-item;">
                    <center>
                    <font face="Arial" color="#0099ff"><h1>TRADE GO</h1></font>
                    <font face="Comic sans MS"><p>Thanks for sign up !</p></font>
                    <i class="fa fa-thumbs-o-up" style="font-size:48px;color:#0099ff"></i>
                    </center>
                    <h3><left>Welcome <font color="#0099ff">${newUser.name}</font> ,</left></h3>
                    <p><center><h4>We are in a great pleasure of welcoming you on board !</h4></center></p>
                    <p class="content" style="font-weight: normal;"><b><font size="4px" color="#4964FB">       Trade GO</font></b>     gives users the opportunity to sell and buy products online.
                        We are all about to making it easy for you to trade online. You can now interact with the users and trade goods all over the world. </p>
                    <center>
                    <div class="endgreet" style="width: auto; height: auto; margin-top: 45px; margin-bottom: 45px; letter-spacing: 1.5px; border-radius: 15px; border: 3px outset #0099ff; background-color: #0099ff; text-align: center; box-shadow: 5px 5px 10px 2px rgba(156, 154, 154, 0.932);">
                        <p><b><font face="Arial" color="white">! HAPPY TRADING !</font></b></p>
                    </div>
                    <img src="https://trade-go.s3.ap-south-1.amazonaws.com/Adobe_Post_20210726_1855140.9031505963136341+(2).png" style="object-fit:contain;
                                width:100px;
                                height:100px;
                                border: solid 1px #CCC">
                    </center>
                    </div>
                  </center> `,
          };
          transporter.sendMail(mailOpt, function (error, info) {
            if (err) {
              console.log("Failed to send Email !\n");
              console.log(error);
            } else {
              console.log("Mail sent Successfully :\n" + info);
            }
          });
          const accessToken = utils.generateAccessToken(newUser);

          res.status(200).send({
            success: true,
            msg: "User Created Successfully !",
            accessToken: accessToken,
            name: newUser.name,
            picture: newUser.picture,
            email: newUser.email,
          });
        }
      });
    })
      .clone()
      .catch(function (err) {
        console.log(err);
      });
  },

  LoginUser: async (req, res) => {
    const { email, password } = req.body;
    await User.findOne({ email: email }, function (err, user) {
      if (err) {
        console.log(err);
        res.status(408);
        return res.send({
          success: false,
          msg: "Authentication Failed. ERROR :" + err,
        });
      }
      if (user === null) {
        console.log(user);
        res.status(202);
        return res.send({ success: false, msg: "User does not exist" });
      } else {
        console.log(user);
        user.comparePassword(password, async function (err, isMatch) {
          if (isMatch && !err) {
            const accessToken = utils.generateAccessToken(user);
            res.status(200).send({
              success: true,
              msg: "Login Successfull !",
              accessToken: accessToken,
              name: user.name,
              picture: user.picture,
              email: user.email,
            });
          } else {
            res.status(203).send({
              success: false,
              msg: "Authentication failed !\n WRONG PASSWORD .",
            });
          }
        });
      }
    })
      .clone()
      .catch(function (err) {
        console.log(err);
      });
  },

  LoginUserGoogle: async (req, res) => {
    console.log(req.body.tokenid);
    const { tokenid } = req.body;
    await client
      .verifyIdToken({
        idToken: tokenid,
        audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
      })
      .then((response) => {
        const { email_verified, name, email, picture } = response.payload;
        const password = email.split("@");
        console.log(response.payload);

        if (email_verified) {
          User.findOne({ email }, async function (err, user) {
            if (err) {
              console.log(err);
              res.code(400);
              return res.send({
                success: false,
                msg: "Something went wrong ! Try again",
              });
            } else {
              if (user) {
                user.picture = picture;
                await user.save(async function (err, newUser) {
                  if (err) {
                    console.log(err);
                    res.code(408);
                    return res.send({
                      sucess: false,
                      msg: "Email Id already Signed up with another Social Media Platform !",
                    });
                  } else {
                    const accessToken = utils.generateAccessToken(newUser);

                    res.code(200);
                    return res.send({
                      success: true,
                      msg: "Login Successfull ! : " + response.mail,
                      accessToken: accessToken,
                      userDetails: newUser,
                    });
                  }
                });
              } else {
                var newUser = User({
                  name: name,
                  email: email,
                  password: password[0],
                  picture: picture,
                });
                await newUser.save(async function (err, newUser) {
                  if (err) {
                    console.log(err);
                    res.code(408);
                    return res.send({
                      sucess: false,
                      msg: "Failed to create User !. Try again",
                    });
                  } else {
                    const accessToken = utils.generateAccessToken(newUser);
                    res.code(200);
                    return res.send({
                      success: true,
                      msg: "Successfully created user ! : " + response.mail,
                      accessToken: accessToken,
                      userDetails: newUser,
                    });
                  }
                });
              }
            }
          });
        } else {
          console.log("Is Email Verified ? " + email_verified);
          res.code(408);
          return res.send({
            success: false,
            msg: "Email not verified !. Try again",
          });
        }
      });
  },

  LoginUserFacebook: async (req, res) => {
    const { accessToken, userID } = req.body;
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
      method: "GET",
    })
      .then((result) => result.json())
      .then((result) => {
        const email = result.email;
        const name = result.name;
        const picture = result.picture.data.url;
        const password = email.split("@");
        console.log(result);
        User.findOne({ email }, async function (err, user) {
          if (err) {
            console.log(err);
            res.code(400);
            return res.send({
              success: false,
              msg: "Something went wrong ! Try again",
            });
          } else {
            if (user) {
              user.picture = picture;
              await user.save(async function (err, newUser) {
                if (err) {
                  console.log(err);
                  res.code(408);
                  return res.send({
                    sucess: false,
                    msg: "Failed to login User !. Try again",
                  });
                } else {
                  const accessToken = utils.generateAccessToken(newUser);
                  res.code(200);
                  return res.send({
                    success: true,
                    msg: "Login Successfull !",
                    accessToken: accessToken,
                    userDetails: newUser,
                  });
                }
              });
            } else {
              var freshUser = User({
                name: name,
                email: email,
                password: password[0],
                picture: picture,
              });
              await freshUser.save(function (err, newUser) {
                if (err) {
                  console.log(err);
                  res.code(408);
                  return res.send({
                    sucess: false,
                    msg: "Failed to create User !. Try again",
                  });
                } else {
                  const accessToken = utils.generateAccessToken(newUser);
                  res.code(200);
                  return res.send({
                    success: true,
                    msg: "Successfully created user !",
                    accessToken: accessToken,
                    userDetails: newUser,
                  });
                }
              });
            }
          }
        });
      });
  },
};
module.exports = { functions };
