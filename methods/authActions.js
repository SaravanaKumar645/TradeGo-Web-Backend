const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const utils = require("./utils");
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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
        return res.send({
          success: false,
          msg: "User does not exist. Register a new Account !",
        });
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

  SendPasswordResetMail: async (req, res) => {
    const userEmail = req.body.email;
    crypto.randomBytes(16, async (err, buffer) => {
      if (err) {
        console.log("Inside crypto block :" + err);
        res.status(405);
        return res.send({
          success: false,
          msg: "An error occured !. Try again ",
          token: null,
        });
      } else {
        console.log("Requested Mail ::");
        console.log(userEmail);
        const token = buffer.toString("hex");
        await User.findOne({ email: userEmail }, function (err, user) {
          if (err) {
            console.log("Inside outer block :" + err);
            res.status(405);
            return res.send({
              success: false,
              msg: "Error in retrieving user details !\nCheck your email.",
              token: null,
            });
          }
          if (user === null) {
            return res.status(408).send({
              success: false,
              msg: "User not exists . Check the email and try again !",
              token: null,
            });
          } else {
            user.idToken = token;
            user.expireToken = Date.now() + 1800000;
            user.save(function (err, user) {
              if (err) {
                console.log("Inside catch nested block :" + err);
                res.status(405);
                return res.send({
                  success: false,
                  msg: "Unexpected error . Try again !",
                  token: null,
                });
              } else {
                var resetLinkMail = {
                  to: user.email,
                  from: "no-reply@tradego.com",
                  subject: "Password reset link -reg",
                  html: `
                                <center>
                                <div class="emailbox" style="width: auto; padding: 40px; height: auto; border-radius: 10px; border: 3px outset rgb(36, 105, 253); display: list-item;">
                                <center>
                                <font face="Arial" color="#0099ff"><h1>TRADE GO</h1></font>
                                </center>
                                <h3>Hi <font color="#0099ff">${user.name}</font> ,</h3>
                                <p><center><h4>All set ! You can now change your Password !</h4></center></p>
                                <p class="content" style="font-weight: normal;">
                                As we have received a request from you for changing the password , we are here below providing you with a <font color="#0099ff"><b>token</b></font> to reset your password. Enter it in the required field and click <font color="#4964FB"><b>Reset Password.</b></font><br> If you don't want to reset the password , kindly ignore this mail.
                                </p>
                                <p><b>NOTE: </b> This token will be valid only for the next <font size="4px" color="red"><b>30 minutes .</b></font></p>
                                <center>
                                <div class="endgreet" style="width: auto; height: auto; margin-top: 45px; margin-bottom: 45px; letter-spacing: 1.5px; border-radius: 15px;
                                padding:10px; border: 3px outset #000000; background-color: #ffffff; text-align: center; box-shadow: 5px 5px 10px 2px rgba(156, 154, 154, 0.932);">
                                    <p><h4>RESET  TOKEN :</h4></p>
                                    <p><font face="Arial" color="#0099ff" style="letter-spacing: 0px;">${token}</font></p>
                                 </div>
                                <img src="https://trade-go.s3.ap-south-1.amazonaws.com/Adobe_Post_20210726_1855140.9031505963136341+(2).png" style="object-fit:contain;
                                    width:100px;
                                    height:100px;
                                    border: solid 1px #CCC">
                                </center>
                                </div>
                                </center>
                        `,
                };
                transporter.sendMail(resetLinkMail, function (error, info) {
                  if (error) {
                    res.status(408);
                    return res.send({
                      success: false,
                      msg: "Email not sent . Kindly try again !",
                      token: null,
                    });
                  } else {
                    console.log("Mail Sent : ");
                    console.log(info);
                    res.status(200);
                    return res.send({
                      success: true,
                      msg: "Email sent !.Check your mail. Sometimes the mail will be in SPAM folder.",
                      token: token,
                    });
                  }
                });
              }
            });
          }
        })
          .clone()
          .catch(function (err) {
            console.log(err);
          });
      }
    });
  },

  ResetPassword: async function (req, res) {
    const email = req.body.email;
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    User.findOne(
      { resetToken: token, email: email, expireToken: { $gte: Date.now() } },
      async (err, user) => {
        if (err) {
          console.log(err);
          res.status(405);
          return res.send({
            success: false,
            msg: "Error in retrieving user details !",
          });
        }
        if (user === null) {
          console.log(user);
          res.status(408);
          return res.send({
            success: false,
            msg: "Token validity has expired . Request for a new one !",
          });
        } else {
          var salt = await bcrypt.genSalt(10);
          var hashedPassword = await bcrypt.hash(newPassword, salt);
          console.log("Hashed Password:  " + hashedPassword);
          await User.findOneAndUpdate(
            { resetToken: token, email: email },
            {
              password: hashedPassword,
              expireToken: undefined,
              resetToken: undefined,
            },
            { new: true },
            function (err, user) {
              if (err) {
                res.status(405);
                return res.send({
                  success: false,
                  msg: "Error in retrieving user details !",
                });
              }
              if (user == null) {
                console.log(user);
                res.status(408);
                return res.send({
                  success: false,
                  msg: "Token validity has expired . Request for a new one !",
                });
              } else {
                var mailOpts = {
                  to: user.email,
                  from: "no-reply@tradego.com",
                  subject: "Password reset link -reg",
                  text: `Hello ${user.name},\n   You have successfully updated your password . You can now login with a new password .\nregards,\nTradeGo`,
                };
                transporter.sendMail(mailOpts, function (error, info) {
                  if (error) {
                    console.log("Mail not sent");
                    console.log(error);
                  } else {
                    console.log("Mail Sent : ");
                    console.log(info);
                  }
                });
                console.log("Updated User: ");
                console.log(user);
                res.status(200);
                return res.send({
                  success: true,
                  msg: "Password updated successfully .",
                });
              }
            }
          )
            .clone()
            .catch(function (err) {
              console.log(err);
            });
        }
      }
    );
  },
};
module.exports = { functions };
