var config = require('../../config');
var Merchant = require('../../model/Merchant').Merchant;
var MerchantProfile = require('../../model/MerchantProfile').MerchantProfile;
var ServiceSet = require('../../model/ServiceSet').ServiceSet;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ServiceItemProfile = require('../../model/ServiceItemProfile').ServiceItemProfile;
var Store = require('../../model/Store.js').Store;
var Comment = require('../../model/Comment').Comment;
var memberServer = require('../../services/member-service');
var merchantPointServer = require('../../services/merchantPoint-service');

//获取商户列表
var list = function (req, res, next) {
  var query = req.query;
  var address = query.address;
  var briefFields = '_id merchantName logoImage createdAt state rate rateExplain useExplain largessExplain';
  Merchant.find({state:'0000-0000-0000'}, briefFields).populate('logoImage', 'imageUrl').exec(function (err, merchantList) {
    if (err) return next(err);
    var data = [];
    var merchantLen = merchantList.length;

    function merchantLoop(i) {
      if (i < merchantLen) {
        var merchant = merchantList[i];
        memberServer.countMembersByMerchantId(merchant._id, function (status_c, result_c) {
          var memberNum = result_c.count;
          merchantPointServer.getMerchantPoint(merchant._id, function (status_point, result_point) {
            if (status_point === 200) {
              var merchantPoint = result_point.merchantPoint;
              if (!address) {
                address = '北京';
              }
              Store.find({merchant:merchant._id, address:{ $regex:address, $options:'i' }, state:'0000-0000-0000'}, function (err, storeList) {
                var stores_data = [];
                if (storeList) {
                  storeList.forEach(function (store) {
                    var store_data = {
                      _id        :store._id,
                      vipImage   :[config.webRoot, config.imageRoot , store.vipImage].join(''),
                      storeName  :store.storeName,
                      merchant   :store.merchant,
                      description:store.description,
                      slogan     :store.slogan,
                      telephone  :store.telephone,
                      address    :store.address,
                      state      :store.state,
                      updatedAt  :store.updatedAt,
                      createdAt  :store.createdAt,
                      location   :store.location
                    };
                    stores_data.push(store_data);
                  });
                }
                var mer = {
                  _id           :merchant._id,
                  merchantName  :merchant.merchantName, //商户名称
                  rate          :merchant.rate, //商户的会员积分与平台积分的兑换率
                  rateExplain   :merchant.rateExplain, //商户的会员积分与平台积分的兑换说明/规则
                  useExplain    :merchant.useExplain, //商户的会员积分的使用说明/规则
                  largessExplain:merchant.largessExplain, //商户的会员积分的赠送说明/规则
                  memberNum     :memberNum, //商户的会员数
                  point         :merchantPoint ? merchantPoint.availablePoint : 0, //商户的平台积分
                  stores        :stores_data, //商户下的门店
                  createdAt     :merchant.createdAt, //商户的加盟时间
                  logoUrl       :[config.webRoot, config.imageRoot , merchant.logoImage ? merchant.logoImage.imageUrl : ''].join('')//商户logo
                };
                data.push(mer)
                merchantLoop(i + 1);
              });
            }
          });
        });
      } else {
        res.json(200, data);
      }
    }

    merchantLoop(0);
  });
};

//获取商户详细信息
var detail = function (req, res, next) {
  var merchantId = req.params.id;
  //查询商户信息
  var detailFields = '_id merchantName description customerServicePhone webSite';
  Merchant.findById(merchantId, detailFields, function (err, merchant) {
    if (err) return next(err);
    if (merchant) {
      //查询商户扩展信息
      MerchantProfile.find({_type:'MerchantProfile', merchant:merchantId}).populate('attribute').exec(function (err, attrs) {
        if (err) return next(err);
        //缓存商户数据
        var merchantData = {
          _id                 :merchant._id,
          merchantName        :merchant.merchantName,
          description         :merchant.description,
          customerServicePhone:merchant.customerServicePhone,
          webSite             :merchant.webSite
        };
        if (!err && attrs) {
          attrs.forEach(function (attr) {
            merchantData[attr.attribute.attributeName] = attr.value;
          });
        }
        //查询服务套餐列表信息（注：服务套餐信息不需要传递给ios端）
        ServiceSet.find({merchant:merchant}, '_id', function (err, serviceSetList) {
          if (err) return next(err);
          var serviceItemList_data = [];
          var serviceSetLen = serviceSetList.length;

          function serviceSetLoop(i) {
            if (i < serviceSetLen) {
              var serviceSet = serviceSetList[i];
              //查询服务项目列表信息(包括可用门店信息)
              ServiceItem.find({serviceSet:serviceSet}).populate('postImage', 'imageUrl retinaUrl').exec(function (err, serviceItemList) {
                if (err) return next(err);
                var serviceItemLen = serviceItemList.length;

                function serviceItemLoop(j) {
                  if (j < serviceItemLen) {
                    var serviceItem = serviceItemList[j];
                    //查询服务项目扩展信息
                    ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItem._id}).populate('attribute').exec(function (err, attrs) {
                      if (err) return next(err);
                      var serviceItemData = {
                        _id            :serviceItem._id,
                        description    :serviceItem.description,
                        serviceItemName:serviceItem.serviceItemName,
                        serviceItemType:serviceItem.serviceItemType,
                        isMemberOnly   :serviceItem.isMemberOnly,
                        isRequireApply :serviceItem.isRequireApply,
                        isApplicable   :serviceItem.isApplicable,
                        isRequireAudit :serviceItem.isRequireAudit,
                        allowLargess   :serviceItem.allowLargess,
                        allowShare     :serviceItem.allowShare,
                        fromDate       :serviceItem.fromDate,
                        toDate         :serviceItem.toDate,
                        applyExplain   :serviceItem.applyExplain,
                        logoImage      :[config.webRoot, config.imageRoot , serviceItem.postImage ? serviceItem.postImage.imageUrl : ''].join(''),
                        posterImage    :[config.webRoot, config.imageRoot , serviceItem.postImage ? serviceItem.postImage.retinaUrl : ''].join(''),
                        ruleText       :serviceItem.ruleText,
                        usableStores   :serviceItem.usableStores ? serviceItem.usableStores.join(',') : null,
                        state          :serviceItem.state
                      };
                      if (!err && attrs) {
                        attrs.forEach(function (attr) {
                          serviceItemData[attr.attribute.attributeName] = attr.value;
                        });
                      }
                      serviceItemList_data.push(serviceItemData);
                      serviceItemLoop(j + 1);
                    });
                  } else {
                    serviceSetLoop(i + 1);
                  }
                }

                serviceItemLoop(0);
              });
            } else {
              merchantData.serviceItems = serviceItemList_data;
              Comment.find({merchant:merchant, state:'0000-0000-0000'}, function (err, commentList) {
                if (err) return next(err);
                merchantData.comments = commentList;
                res.json(200, merchantData);
              });
            }
          }

          serviceSetLoop(0);
        });
      });
    } else {
      res.json(404, {errors:'商户数据未找到.'});
    }
  });
};

module.exports = {
  list  :list,
  detail:detail
};