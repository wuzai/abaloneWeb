var UserProfile = require('../../model/UserProfile').UserProfile;
var globalSettingServer = require('../../services/globalSetting-service');
var userServer = require('../../services/user-service');

//注册
var signUp = function (req, res, next) {
  var body = req.body;
  var captcha = body.captcha;
  var username = body.username;
  var password = body.password;
  userServer.userSignUp(username, password, captcha, function (status, result) {
    if (status === 200) {
      var user = result.user;
      var userPoint = result.userPoint;
      res.json(201, {_id:user._id, userName:user.userName, point:userPoint});
    } else {
      res.json(status, {errors:result.error});
    }
  });
};

//登录
var signIn = function (req, res, next) {
  var userName = req.body.username;
  var password = req.body.password;
  if (!req.body || !userName || !password) {
    res.json(400, {errors:'用户名和密码不能为空.'});
    return;
  }
  userServer.userSignIn(userName, password, function (status_user, result_user) {
    if (status_user === 200) {
      var user = result_user.user;
      UserProfile.find({_type:'UserProfile', user:user._id}).populate('attribute').exec(function (err, attrs) {
        var data = {
          _id     :user._id,
          userName:user.userName
        };
        if (!err && attrs) {
          attrs.forEach(function (attr) {
            data[attr.attribute.attributeName] = attr.value;
          });
        }
        globalSettingServer.getGlobalSettingBySettingName('pointLargessExplain', function (status_conf, result_conf) {
          var config_default = {
            _id                :'1',
            pointLargessExplain:result_conf.defaultValue,
            lastUpdateTime     :new Date()
          };
          data.config = config_default;
          res.json(200, data);
        });
      });
    } else {
      res.json(410, {errors:result_user.error});
    }
  });
};

module.exports = {
  signUp:signUp,
  signIn:signIn
};