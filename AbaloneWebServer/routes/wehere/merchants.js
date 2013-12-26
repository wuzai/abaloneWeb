var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var Merchant = require('../../model/Merchant').Merchant;
var ImageStore = require('../../model/ImageStore').ImageStore;
var Employee = require('../../model/Employee').Employee;
var ObjectId = require('mongoose').Types.ObjectId;
var fileServer = require('../../utils/file-server');
var profileServer = require('../../services/profile-service');
var merchantServer = require('../../services/merchant-service');
var merchantInMerchantServer = require('../../services/merchantInMerchant-service');
var weiXinInMerchantServer = require('../../services/weiXinInMerchant-service');
var storeServer = require('../../services/store-service');
var userServer = require('../../services/user-service');
var swiss = require('../../utils/swiss-kit');

/**
 * 验证商户信息
 * @param merchantInfo 商户信息
 */
var validationMerchantInfo = function (merchantInfo) {
  var result = {flag:false, message:'参数传递错误.'};
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    if (merchantInfo.customerServicePhone && !swiss.isPhone(merchantInfo.customerServicePhone)) {
      result.message = '客服电话输入错误.';
    } else if (merchantInfo.webSite && !swiss.isUrl(merchantInfo.webSite)) {
      result.message = '网站地址输入错误.';
    } else if (merchantInfo.rate && !swiss.isInteger(merchantInfo.rate)) {
      result.message = '兑换率必须是整数.';
    } else {
      result.flag = true;
      result.message = '';
    }
  } else {
    result.message = '商户名称不能为空.';
  }
  return result;
};

/**
 * 商户注册页面
 * @param req
 * @param res
 */
var signUpPage = function (req, res) {
  var query = req.query;
  //userId从会话中获取，如果userId为空，提醒用户登录
  var user = req.session.user;
  if (user && user._id) {
    var userId = user._id;
    Merchant.findOne({creator:userId}, '_id', function (err, merchant) {
      if (merchant) {
        req.session.messages = {error:['您的账号已经创建了商户']};
        res.redirect([webRoot_wehere , '/dashboard'].join(''));
      } else {
        var merchantRankId = query.merchantRankId;
        if (merchantRankId) {
          res.render('wehere/merchantSignUp', {
            userId        :userId,
            merchantRankId:merchantRankId
          });
        } else {
          req.session.messages = {error:['请选择商户类型']};
          res.redirect([webRoot_wehere, '/merchantRank'].join(''));
        }
      }
    });
  } else {
    req.session.messages = {error:['用户未登录，请先登录']};
    res.redirect('/userSignIn');
  }
};

/**
 * 商户信息保存
 * @param req
 * @param merchantInfo 商户信息
 * @param callback
 */
var merchantSave = function (req, merchantInfo, callback) {
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    var merchantName = merchantInfo.merchantName.trim();
    Merchant.count({merchantName:merchantName}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'商户名称已被注册.'});
        return;
      }
      if (merchantInfo.rate && !swiss.isInteger(merchantInfo.rate)) {
        callback(400, {error:'兑换率必须是整数.'});
        return;
      }
      var merchant = new Merchant({
        merchantName        :merchantName,
        merchantRank        :merchantInfo.merchantRank,
        description         :merchantInfo.description,
        customerServicePhone:merchantInfo.customerServicePhone,
        webSite             :merchantInfo.webSite,
        rate                :merchantInfo.rate,
        rateExplain         :merchantInfo.rateExplain,
        creator             :merchantInfo.creator
      });
      fileServer.uploadFileMain(req, 'logoImage', '/sys/user/images', function (data) {
        if (data.success) {
          var url = data.fileUrl;
          var imageStore = new ImageStore({
            imageUrl    :url,
            retinaUrl   :url,
            smallUrl    :url,
            thumbnailUrl:url
          });
          merchant.logoImage = imageStore;
          imageStore.save();
        }
        merchant.save(function (err, new_merchant) {
          if (err) return callback(404, {error:err});
          profileServer.addMerchantOfProfile('intro', new_merchant._id, merchantInfo.intro, function (status, result) {
            callback(200, new_merchant);
          });
        });
      });
    });
  } else {
    callback(400, {error:'商户名称不能为空.'});
    return;
  }
};

//商户注册
var signUp = function (req, res) {
  var body = req.body;
  var merchantInfo = {
    merchantName        :body.merchantName,
    description         :body.description,
    merchantRank        :body.merchantRankId,
    customerServicePhone:body.customerServicePhone ? body.customerServicePhone.trim() : '',
    webSite             :body.webSite ? body.webSite.trim() : '',
    creator             :body.userId,
    rate                :body.rate,
    rateExplain         :body.rateExplain,
    intro               :body.intro
  };
  var result_validation = validationMerchantInfo(merchantInfo);
  if (result_validation.flag) {
    merchantSave(req, merchantInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'商户加盟成功！'};
        res.redirect([webRoot_wehere, '/merchant/info'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/signUp?merchantRankId=', merchantInfo.merchantRank].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/signUp?merchantRankId=', merchantInfo.merchantRank].join(''));
    return;
  }
};

//获取商户信息
var merchantInfo = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  Merchant.findById(merchantId).populate('merchantRank').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (merchant) {
      var merchant_date = {
        _id                 :merchant._id,
        merchantName        :merchant.merchantName,
        merchantRank        :merchant.merchantRank,
        description         :merchant.description,
        customerServicePhone:merchant.customerServicePhone,
        isPublicTel:merchant.isPublicTel,
        webSite             :merchant.webSite,
        creator             :merchant.creator,
        isPerfect           :merchant.isPerfect,
        createdAt           :merchant.createdAt,
        logoImage           :merchant.logoImage ? merchant.logoImage.imageUrl : null,
        rate                :merchant.rate,
        rateExplain         :merchant.rateExplain,
        useExplain          :merchant.useExplain,
        largessExplain      :merchant.largessExplain
      };
      profileServer.findMerchantProfile(merchantId, function (attrJson) {
        var keys = Object.keys(attrJson);
        keys.forEach(function (key) {
          if (attrJson[key]) {
            merchant_date[key] = attrJson[key];
          }
        });
        storeServer.findStoreListByMerchantId(merchantId, function (status, result) {
          userServer.getUserById(merchant.creator, function (status_user, result_user) {
            //判断绑定的微信公众帐号
            weiXinInMerchantServer.getWeiXinInMerchantByMerchantId(merchantId, function (status_weiXinObject, result_weiXinObject) {
              var weiXinObject = '';
              if (status_weiXinObject === 200) {
                weiXinObject = result_weiXinObject.weiXinObject;
              }
              res.render('wehere/merchantInfo', {
                merchant    :merchant_date,
                user        :result_user.user,
                weiXinObject:weiXinObject,
                stores      :result.stores
              });
            });
          })
        });
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var editPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  Merchant.findOne({_id:merchantId, state:'0000-0000-0000'}).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (merchant) {
      var merchant_data = {
        _id                 :merchant._id,
        merchantName        :merchant.merchantName,
        description         :merchant.description,
        customerServicePhone:merchant.customerServicePhone,
        isPublicTel:merchant.isPublicTel,
        webSite             :merchant.webSite,
        rate                :merchant.rate,
        rateExplain         :merchant.rateExplain,
        useExplain          :merchant.useExplain,
        largessExplain      :merchant.largessExplain,
        logoImage           :merchant.logoImage
      };
      profileServer.getMerchantOfProfileValue('intro', merchantId, function (status, result) {
        if (status === 200 && result) {
          merchant_data.intro = result.value;
        }
        res.render('wehere/merchantEdit', {
          merchant:merchant_data
        });
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

/**
 * 商户信息更新保存
 * @param req
 * @param merchantInfo 商户信息
 * @param callback
 */
var merchantUpdate = function (req, merchantInfo, callback) {
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    var merchantName = merchantInfo.merchantName.trim();
    Merchant.count({merchantName:merchantName, _id:{$ne:merchantInfo._id}}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'商户名称已被注册.'});
        return;
      }
      if (merchantInfo.rate && !swiss.isInteger(merchantInfo.rate)) {
        callback(400, {error:'兑换率必须是整数.'});
        return;
      }
      var update_data = {
        merchantName        :merchantName,
        description         :merchantInfo.description,
        customerServicePhone:merchantInfo.customerServicePhone,
        isPublicTel:merchantInfo.isPublicTel ? true : false,
        webSite             :merchantInfo.webSite,
        rate                :merchantInfo.rate,
        rateExplain         :merchantInfo.rateExplain,
        useExplain          :merchantInfo.useExplain,
        largessExplain      :merchantInfo.largessExplain
      };
      fileServer.uploadFileMain(req, 'logoImage', '/sys/user/images', function (data) {
        if (data.success) {
          var url = data.fileUrl;
          var imageStore = new ImageStore({
            imageUrl    :url,
            retinaUrl   :url,
            smallUrl    :url,
            thumbnailUrl:url
          });
          update_data.logoImage = imageStore;
          imageStore.save();
        }
        Merchant.update({_id:merchantInfo._id}, update_data, function (err, new_merchant) {
          if (err) return callback(404, {error:err});
          profileServer.editMerchantOfProfile('intro', merchantInfo._id, merchantInfo.intro, function (status, result) {
            callback(200, new_merchant);
          });
        });
      });
    });
  } else {
    callback(400, {error:'商户名称不能为空.'});
    return;
  }
};

var editSave = function (req, res) {
  var body = req.body;
  var merchantInfo = {
    _id                 :body.merchantId,
    merchantName        :body.merchantName,
    description         :body.description,
    customerServicePhone:body.customerServicePhone.trim(),
    isPublicTel                :body.isPublicTel,
    webSite             :body.webSite.trim(),
    rate                :body.rate,
    rateExplain         :body.rateExplain,
    useExplain          :body.useExplain,
    largessExplain      :body.largessExplain,
    intro               :body.intro
  };
  var result_validation = validationMerchantInfo(merchantInfo);
  if (result_validation.flag) {
    merchantUpdate(req, merchantInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'商户信息修改成功！'};
        res.redirect([webRoot_wehere, '/merchant/info'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/edit?merchantId=' , merchantInfo._id].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/edit?merchantId=' , merchantInfo._id].join(''));
    return;
  }
};

//打开商户联盟页面
var openMerchantUnionPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  //获取该商户已联盟的商户
  merchantInMerchantServer.findSubMerchantByMerchantId(merchantId, function (status_subMerchant, result_subMerchant) {
    if (result_subMerchant) {
      var merchantIds = result_subMerchant.merchantIds;
      merchantIds.push(merchantId);
      merchantServer.findMerchantOfUnion(merchantIds, function (status_merchant, result_merchant) {
        if (result_merchant.merchants) {
          res.render('wehere/merchantUnion', {
            merchantId  :merchantId,
            merchants   :result_subMerchant.merchants, //已选商户
            disMerchants:result_merchant.merchants//未选商户
          });
        } else {
          req.session.messages = {error:['未获取到相关数据']};
          res.redirect([webRoot_wehere , '/dashboard'].join(''));
        }
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

//保存商户联盟关联数据
var merchantUnionSave = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var merchantIds = body.merchantIds;
  var merchantIdList = [];
  var flag = typeof(merchantIds);
  if (flag === 'string') {
    merchantIdList.push(merchantIds);
  } else {
    merchantIdList = merchantIdList.concat(merchantIds);
  }
  merchantInMerchantServer.saveMerchantInMerchantBySubIds(merchantId, merchantIdList, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:'该商户已经成功加入商务会所.'};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    }
  });
};

var merchantUnionDelete = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var subMerchantId = query.merchantId;
  merchantInMerchantServer.deleteMerchantInMerchant(merchantId, subMerchantId, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:'该商户与商务会所联盟关系已解除.'};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    }
  });
};

module.exports = {
  merchantInfo         :merchantInfo,
  editPage             :editPage,
  editSave             :editSave,
  signUpPage           :signUpPage,
  signUp               :signUp,
  openMerchantUnionPage:openMerchantUnionPage,
  merchantUnionSave    :merchantUnionSave,
  merchantUnionDelete  :merchantUnionDelete
};