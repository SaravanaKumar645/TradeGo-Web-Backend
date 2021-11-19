const Auth_Action = require("../methods/authActions");
const methods = Auth_Action.functions;
const routes = [
  {
    method: "GET",
    url: "/",
    handler: methods.Home,
  },
  {
    method: "GET",
    url: "/api/",
    handler: methods.Home,
  },
  {
    method: "POST",
    url: "/api/register-user",
    handler: methods.RegisterUser,
  },
  {
    method: "POST",
    url: "/api/login-user",
    handler: methods.LoginUser,
  },
  {
    method: "POST",
    url: "/api/login-user/google",
    handler: methods.LoginUserGoogle,
  },
  {
    method: "POST",
    url: "/api/login-user/facebook",
    handler: methods.LoginUserFacebook,
  },
  {
    method: "POST",
    url: "/api/send-reset-mail",
    handler: methods.SendPasswordResetMail,
  },
  {
    method: "POST",
    url: "/api/update-user-password",
    handler: methods.ResetPassword,
  },
];
module.exports = routes;
