var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var config = require('../config');
var MerchantRank = require('./MerchantRank').MerchantRank;

/**
 * 商户基本信息表
 * @type {Schema}
 */
var MerchantSchema = new Schema({
  merchantName        :{type:String}, //商户名称
  description         :{type:String}, //商户描述信息
  organization        :{type:Schema.ObjectId, ref:'Organization'}, //所属组织Id
  merchantRank        :{type:Schema.ObjectId, ref:'MerchantRank'}, //商户等级Id
  customerServicePhone:{type:String}, //客服电话
  isPublicTel         :{type:Boolean}, //是否公开客服电话负责人电话
  logoImage           :{type:Schema.ObjectId, ref:'ImageStore'}, //logo图片Id
  webSite             :{type:String}, //商户网站
  isPerfect           :{type:Boolean, default:false}, //商户是否填写资料
  manager             :{type:Schema.ObjectId, ref:'Employee'}, //管理者Id,
  creator             :{type:Schema.ObjectId, ref:'User'}, //商户的创建人Id,
  rate                :{type:Number, default:0}, //商户的用户积分与平台积分的兑换率
  rateExplain         :{type:String}, //兑换说明
  useExplain          :{type:String}, //商户会员积分使用说明
  largessExplain      :{type:String}  //商户会员积分转赠说明
});

MerchantSchema.plugin(commonSchemaPlugin);

exports.Merchant = mongoose.model('Merchant', MerchantSchema);
