var config = require('./config');
var webRoot_wehere = config.webRoot_wehere;
var Merchant = require('./model/Merchant').Merchant;
var index = require('./routes/wehere/index');
var merchantRanks = require('./routes/wehere/merchantRanks');
var merchants = require('./routes/wehere/merchants');
var users = require('./routes/wehere/users');
var stores = require('./routes/wehere/stores');
var members = require('./routes/wehere/members');
var serviceItems = require('./routes/wehere/serviceItems');
var memberPoints = require('./routes/wehere/memberPoints');
var sellRecords = require('./routes/wehere/sellRecords');
var supplyDemands = require('./routes/wehere/supplyDemands');
var advertisements = require('./routes/wehere/advertisements');
var consumeRecords = require('./routes/wehere/consumeRecords');
var comments = require('./routes/wehere/comments');
var messageSendRecords = require('./routes/wehere/messageSendRecords');
var memberServices = require('./routes/wehere/memberServices');
var fileServer = require('./utils/file-server');
var weiXinInMerchantServer = require('./services/weiXinInMerchant-service');


//后台商户web端
exports = module.exports = function (app) {
  //登录拦截器
  var interceptorLogin = function (req, res, next) {
    if (!req.session || !req.session.user) {
      req.session.messages = {error:['用户未登录，请先登录']};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    } else {
      next();
    }
  };
  //商户检测拦截器/审核商户是否存在且登录
  var interceptorMerchant = function (req, res, next) {
    //userId从会话中获取，如果userId为空，提醒用户登录
    var user = req.session.user;
    if (user && user._id) {
      var merchant = req.session.merchant;
      if (merchant && merchant._id) {
        next();
      } else {
        Merchant.findOne({creator:user._id, state:'0000-0000-0000'}, '_id merchantName', function (err, mer) {
          if (mer) {
            req.session.merchant = {_id:mer._id, merchantName:mer.merchantName};
            next();
          } else {
            req.session.messages = {'error':['您的帐号还未创建商户,是否需要创建商户.']};
            res.redirect([webRoot_wehere, '/merchant/toJoin'].join(''));
          }
        });
      }
    } else {
      req.session.messages = {error:['用户未登录，请先登录']};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    }
  };

  //文件服务器---显示图片路由接口
  app.get('/fileServer/showImages', fileServer.getFileByFileUrl);
  //文件服务器---显示视屏路由接口
  app.get('/fileServer/showVideos', fileServer.getFileByFileUrl);
  //kindEditor上传文件接口
  app.post('/kindEditor/nodeJs/upload_json.js', function (req, res) {
    fileServer.uploadFileMain(req, 'imgFile', '/sys/kindEditor/images', function (data) {
      if (data.success) {
        var fileFullUrl = [config.webRoot, config.imageRoot, data.fileUrl].join('');
        res.json({error:0, url:fileFullUrl, width:data.width ? data.width.toString() : null, height:data.height ? data.height.toString() : null});
      } else {
        res.json({error:1, message:data.error});
      }
    });
  });

  app.get('/', function (req, res) {
    res.redirect([webRoot_wehere , '/userSignIn'].join(''));
  });
  //商户首页登录
  app.get(webRoot_wehere, function (req, res) {
    res.redirect([webRoot_wehere , '/userSignIn'].join(''));
  });

  //用户注册
  app.get([webRoot_wehere , '/userSignUp'].join(''), users.openSignUpPage);
  app.post([webRoot_wehere , '/userSignUp'].join(''), users.signUp);
  //用户登录
  app.get([webRoot_wehere , '/userSignIn'].join(''), users.openSignInPage);
  app.post([webRoot_wehere , '/userSignIn'].join(''), users.signIn);
  app.get([webRoot_wehere , '/userSignOut'].join(''), users.signOut);
  //找回密码
  app.get([webRoot_wehere , '/forgetPassword'].join(''), users.forgetPassword);
  //重置密码
  app.get([webRoot_wehere , '/resetPassword'].join(''), users.openResetPasswordPage);
  app.post([webRoot_wehere , '/resetPassword'].join(''), users.resetPassword);
  //重新获取验证码
  app.get([webRoot_wehere , '/afreshCaptcha'].join(''), users.afreshCaptcha);

  //用户空间主页
  app.get([webRoot_wehere , '/dashboard'].join(''), interceptorLogin, index.index);
  //商户加入
  app.get([webRoot_wehere , '/merchant/toJoin'].join(''), interceptorLogin, merchantRanks.merchantRankPage);
  app.get([webRoot_wehere , '/merchant/signUp'].join(''), interceptorLogin, merchants.signUpPage);
  app.post([webRoot_wehere , '/merchant/signUp'].join(''), interceptorLogin, merchants.signUp);

  //商户详情页面
  app.get([webRoot_wehere , '/merchant/info'].join(''), interceptorMerchant, merchants.merchantInfo);
  app.get([webRoot_wehere , '/merchant/edit'].join(''), interceptorMerchant, merchants.editPage);
  app.post([webRoot_wehere , '/merchant/editSave'].join(''), interceptorMerchant, merchants.editSave);

  //门店列表
  app.get([webRoot_wehere , '/merchant/storeList'].join(''), interceptorMerchant, stores.storeList);
  app.post([webRoot_wehere , '/merchant/addStore'].join(''), interceptorMerchant, stores.addStore);
  app.get([webRoot_wehere , '/merchant/storeEdit'].join(''), interceptorMerchant, stores.storeEditPage);
  app.post([webRoot_wehere , '/merchant/storeEditSave'].join(''), interceptorMerchant, stores.storeEditSave);
  app.get([webRoot_wehere , '/merchant/storeImageView'].join(''), interceptorMerchant, stores.storeImageView);
  app.post([webRoot_wehere , '/merchant/uploadImageView'].join(''), interceptorMerchant, stores.uploadImageView);
  app.get([webRoot_wehere , '/merchant/storeDelete'].join(''), interceptorMerchant, stores.storeDelete);
  //商户会员列表
  app.get([webRoot_wehere , '/merchant/memberList'].join(''), interceptorMerchant, members.memberList);
  app.get([webRoot_wehere , '/merchant/memberEnabled'].join(''), interceptorMerchant, members.memberEnabled);
  app.get([webRoot_wehere , '/merchant/memberDisEnabled'].join(''), interceptorMerchant, members.memberDisEnabled);
  app.get([webRoot_wehere , '/merchant/memberInfo'].join(''), interceptorMerchant, members.openMemberInfoPage);

  //商户联盟页面
  app.get([webRoot_wehere , '/merchant/merchantUnion'].join(''), interceptorMerchant, merchants.openMerchantUnionPage);
  //保存商户联盟关联
  app.post([webRoot_wehere , '/merchant/merchantUnionSave'].join(''), interceptorMerchant, merchants.merchantUnionSave);
  //接触商户联盟关联
  app.get([webRoot_wehere , '/merchant/merchantUnionDelete'].join(''), interceptorMerchant, merchants.merchantUnionDelete);

  //打开资源供需列表页面
  app.get([webRoot_wehere , '/merchant/supplyDemandList'].join(''), interceptorMerchant, supplyDemands.supplyDemandList);
  app.post([webRoot_wehere , '/merchant/addSupplyDemand'].join(''), interceptorMerchant, supplyDemands.addSupplyDemand);
  app.get([webRoot_wehere , '/merchant/supplyDemandEdit'].join(''), interceptorMerchant, supplyDemands.supplyDemandEditPage);
  app.post([webRoot_wehere , '/merchant/supplyDemandEditSave'].join(''), interceptorMerchant, supplyDemands.supplyDemandEditSave);
  app.get([webRoot_wehere , '/merchant/supplyDemandDelete'].join(''), interceptorMerchant, supplyDemands.supplyDemandDelete);

  //服务项目
  app.get([webRoot_wehere , '/service/serviceItemList'].join(''), interceptorMerchant, serviceItems.serviceItemList);
  app.get([webRoot_wehere , '/service/openServiceItemAddPage'].join(''), interceptorMerchant, serviceItems.openServiceItemAddPage);
  app.post([webRoot_wehere , '/service/addServiceItem'].join(''), interceptorMerchant, serviceItems.addServiceItem);
  app.get([webRoot_wehere , '/service/serviceItemEdit'].join(''), interceptorMerchant, serviceItems.serviceItemEditPage);
  app.post([webRoot_wehere , '/service/serviceItemEditSave'].join(''), interceptorMerchant, serviceItems.serviceItemEditSave);
  app.get([webRoot_wehere , '/service/serviceItemDelete'].join(''), interceptorMerchant, serviceItems.serviceItemDelete);
  app.get([webRoot_wehere, '/service/findStoresByServiceItemId'].join(''), interceptorMerchant, serviceItems.findStoresByServiceItemId);
  app.post([webRoot_wehere , '/service/usableStoresSave'].join(''), interceptorMerchant, serviceItems.usableStoresSave);
  //销售记录列表
  app.get([webRoot_wehere , '/service/sellRecordList'].join(''), interceptorMerchant, sellRecords.sellRecordList);

  //服务申领审核
  app.get([webRoot_wehere , '/serviceAudit/serviceItemApply'].join(''), interceptorMerchant, sellRecords.serviceItemApplyPage);
  //审核通过申领
  app.get([webRoot_wehere , '/serviceAudit/serviceItemAuditPass'].join(''), interceptorMerchant, sellRecords.serviceItemAuditPass);
  //审核取消申领
  app.get([webRoot_wehere , '/serviceAudit/serviceItemAuditNoPass'].join(''), interceptorMerchant, sellRecords.serviceItemAuditNoPass);
  //审核服务使用
  app.get([webRoot_wehere , '/serviceAudit/serviceItemUsed'].join(''), interceptorMerchant, sellRecords.serviceItemUsedPage);
  //商户端审核用户使用请求
  app.post([webRoot_wehere , '/serviceAudit/serviceItemUsedCheck'].join(''), interceptorMerchant, sellRecords.serviceItemUsedCheck);
  //商户端取消用户使用请求
  app.get([webRoot_wehere , '/serviceAudit/serviceItemUsedCancel'].join(''), interceptorMerchant, sellRecords.serviceItemUsedCancel);

  //商户端服务使用发送验证码
  app.get([webRoot_wehere , '/memberService/sendCaptchaOfUsedByMerchant'].join(''), interceptorMerchant, memberServices.sendCaptchaOfUsedByMerchant);
  app.get([webRoot_wehere , '/memberService/memberServiceUsed'].join(''), interceptorMerchant, memberServices.memberServiceUsed);
  app.get([webRoot_wehere , '/memberService/gotoMemberInfoPage'].join(''), interceptorMerchant, memberServices.gotoMemberInfoPage);
  //会员充值
  app.get([webRoot_wehere , '/point/memberPointAdd'].join(''), interceptorMerchant, memberPoints.pointAddPage);
  app.get([webRoot_wehere , '/point/memberPointAddCheck'].join(''), interceptorMerchant, memberPoints.memberPointAddCheck);
  app.post([webRoot_wehere , '/point/memberPointAddSave'].join(''), interceptorMerchant, memberPoints.pointAddSave);
  app.get([webRoot_wehere , '/point/consumeRecordList'].join(''), interceptorMerchant, consumeRecords.consumeRecordList);
  //会员积分使用
  app.get([webRoot_wehere , '/point/memberPointUsed'].join(''), interceptorMerchant, memberPoints.memberPointUsedPage);
  app.get([webRoot_wehere , '/point/getCaptchaByPointUsed'].join(''), interceptorMerchant, memberPoints.getCaptchaByPointUsed);
  app.get([webRoot_wehere , '/point/memberPointUsedSave'].join(''), interceptorMerchant, memberPoints.memberPointUsedSave);


  //发布活动、广告
  app.get([webRoot_wehere , '/advertisement'].join(''), interceptorMerchant, advertisements.advertisementList);
  app.post([webRoot_wehere , '/advertisement/addAdvertisementSave'].join(''), interceptorMerchant, advertisements.advertisementAddSave);
  app.get([webRoot_wehere , '/advertisement/editAdvertisement'].join(''), interceptorMerchant, advertisements.advertisementEditPage);
  app.post([webRoot_wehere , '/advertisement/editAdvertisementSave'].join(''), interceptorMerchant, advertisements.advertisementEditSave);
  app.get([webRoot_wehere , '/advertisement/advertisementDelete'].join(''), interceptorMerchant, advertisements.advertisementDelete);

  //商户消息发布
  app.get([webRoot_wehere , '/message/messageSend'].join(''), interceptorMerchant, messageSendRecords.openMessageSendPage);
  app.post([webRoot_wehere , '/message/messageSendSave'].join(''), interceptorMerchant, messageSendRecords.messageSendSave);
  //商户消息
  app.get([webRoot_wehere , '/message/messagesOfMerchant'].join(''), interceptorMerchant, messageSendRecords.openMessagesOfMerchant);
  //用户评论列表
  app.get([webRoot_wehere , '/message/commentList'].join(''), interceptorMerchant, comments.commentList);

  //建立微信与贝客汇商户的关联
  app.get([webRoot_wehere , '/weiXinInMerchant'].join(''), function (req, res) {
    var query = req.query;
    var merchantId = query.merchantId;
    var weiXinObject = query.weiXinObject ? query.weiXinObject.trim() : '';
    if (weiXinObject && merchantId) {
      weiXinInMerchantServer.updateWeiXinInMerchant(weiXinObject, merchantId, function (status_wx, result_wx) {
        if (status_wx === 200) {
          res.json({status:200});
        } else {
          res.json({status:404, error:result_wx.error});
        }
      });
    } else {
      res.json({status:404, error:'参数传递错误'});
    }
  });
};