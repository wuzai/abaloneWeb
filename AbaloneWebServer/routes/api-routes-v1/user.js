var User = require('../../model/User.js').User;
var tokenHelper = require('../../utils/token-helper');
var UserProfile = require('../../model/UserProfile').UserProfile;
var AttributeDictionary = require('../../model/AttributeDictionary').AttributeDictionary;
var ObjectId = require('mongoose').Types.ObjectId;
var captchaRecordServer = require('../../services/captchaRecord-service');
var userServer = require('../../services/user-service');

//获取用户数据
var getUserById = function (req, res, next) {
  var userId = req.params.id;
  var userDetailFields = '_id userName';
  User.findById(userId, userDetailFields, function (err, user) {
    if (err) return next(err);
    if (user) {
      UserProfile.find({_type:'UserProfile', user:userId}).populate('attribute').exec(function (err, attrs) {
        if (err) return next(err);
        var userData = {
          _id     :user._id,
          userName:user.userName
        };
        if (!err && attrs) {
          attrs.forEach(function (attr) {
            userData[attr.attribute.attributeName] = attr.value;
          });
        }
        res.json(200, userData);
      });
    } else {
      res.json(404, {errors:'用户数据未找到.'});
    }
  });
}

//修改用户密码
var updatePassword = function (req, res, next) {
  var body = req.body;
  var userId = req.params.id;
  var userDetailFields = 'passwordDigest hashFormat passwordSalt';
  User.findById(userId, userDetailFields, function (err, user) {
    if (err) return next(err);
    if (user) {
      if (!req.body || !req.body.old_password || !req.body.new_password) {
        res.json(400, {errors:'密码必须输入.'});
        return;
      }
      var digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, body.old_password);
      if (digest === user.passwordDigest) {
        var new_digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, body.new_password);
        var date = new Date();
        User.update({ _id:userId }, { passwordDigest:new_digest, lastChangePasswordTime:date, updatedAt:date }, function (err, new_user) {
          if (err) return next(err);
          res.json(200, {});
          return;
        });
      } else {
        res.json(410, '原密码错误.');
        return;
      }
    } else {
      res.json(404, {errors:'用户未找到'});
    }
  });
}

//忘记密码时,重置密码
var resetPassword = function (req, res, next) {
  var body = req.body;
  var captcha = req.body.captcha;
  var cellphone = req.body.cellphone;
  var password = req.body.password;
  if (!body || !captcha || !cellphone) {
    res.json(400, {errors:'验证码或电话不能为空.'});
    return;
  }
  if (!password) {
    res.json(400, {errors:'重置密码不能为空.'});
    return;
  }
  captchaRecordServer.checkCaptcha(captcha, cellphone, '找回密码', function (status, result) {
    if (status === 200) {
      var captchaRecord = result.captchaRecord;
      User.findOne({userName:cellphone}, function (err, user) {
        if (err) return next(err);
        if (user) {
          var new_digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
          var date = new Date();
          User.update({ _id:user._id }, { passwordDigest:new_digest, lastChangePasswordTime:date, updatedAt:date }, function (err, new_user) {
            if (err) return next(err);
            //用户修改成功,验证码修改为已使用状态
            captchaRecord.hasUsed = true;
            captchaRecord.save(function (err, new_captchaRecord) {
              UserProfile.find({_type:'UserProfile', user:user._id}).populate('attribute').exec(function (err, attrs) {
                var userData = {
                  _id     :user._id,
                  userName:user.userName
                };
                if (!err && attrs) {
                  attrs.forEach(function (attr) {
                    userData[attr.attribute.attributeName] = attr.value;
                  });
                }
                res.json(200, userData);
              });
            });
          });
        } else {
          res.json(404, {errors:'用户数据未找到.'});
        }
      });
    } else {
      res.json(410, {errors:result.error});
    }
  });
};

//修改用户资料
var updateUserById = function (req, res, next) {
  var body = req.body;
  var userId = req.params.id;
  if (!req.body) {
    res.json(400, {errors:'请求参数错误.'});
  } else {
    var paramKeys = Object.keys(body);
    User.findByIdAndUpdate(userId, { updatedAt:new Date() }, function (err, user) {
      if (err) return next(err);
      if (!user) {
        res.json(404, {errors:'用户数据未找到.'});
        return;
      }
      AttributeDictionary.find({category:'User'}, function (err, attributeDictionaryList) {
        if (err) return next(err);
        if (attributeDictionaryList.length > 0) {
          var attributeNames = [];//扩展属性字典中的属性名
          attributeDictionaryList.forEach(function (attribute) {
            attributeNames.push(attribute.attributeName);
          });
          UserProfile.find({_type:'UserProfile', user:userId}).populate('attribute').exec(function (err, attrs) {
            if (err) return next(err);
            var attrNames = [];//用户已经增加的属性名
            attrs.forEach(function (attr) {
              attrNames.push(attr.attribute.attributeName);
            });
            var updateAttrNames = [];//字段更新
            var saveAttrNames = [];//字段新增保存
            paramKeys.forEach(function (paramKey) {
              if (attributeNames.indexOf(paramKey) > -1) {
                if (attrNames.indexOf(paramKey) > -1) {
                  updateAttrNames.push(paramKey);
                } else {
                  saveAttrNames.push(paramKey);
                }
              }
            });
            //已有字段更新
            for (var m in updateAttrNames) {
              var paramKey = updateAttrNames[m];
              for (var n in attrs) {
                var attr = attrs[n];
                if (attr.attribute.attributeName === paramKey) {
                  attr.value = req.body[paramKey];
                  attr.save();
                  break;
                }
              }
            }
            //没有的字段新增
            var userIdObj = new ObjectId(userId);
            for (var i in saveAttrNames) {
              var paramKey = saveAttrNames[i];
              for (var j in attributeDictionaryList) {
                var attribute = attributeDictionaryList[j];
                if (attribute.attributeName === paramKey) {
                  var new_userProfile = new UserProfile();
                  new_userProfile.user = userIdObj;
                  new_userProfile.attribute = attribute._id;
                  new_userProfile.value = body[paramKey];
                  new_userProfile.save();
                  break;
                }
              }
            }
            if (!user.isPerfect) {
              //如果用户首次修改资料
              userServer.userUpdateInfoOfFirst(userIdObj, function (status, result) {
                console.log(result);
              });
            }
            res.json(200, {});
          });
        } else {
          res.json(200, {});
          return;
        }
      });
    });
  }
};


module.exports = {
  getUserById   :getUserById,
  updatePassword:updatePassword,
  resetPassword :resetPassword,
  updateUserById:updateUserById
};