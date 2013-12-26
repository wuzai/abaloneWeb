var config = require('./config');
var webRoot_sys = config.webRoot_sys;
//基础数据模块
var AppKeyForm = require('./model-form/AppKeyForm').AppKeyForm;
var ApplicationForm = require('./model-form/ApplicationForm').ApplicationForm;
var AttributeDictionaryForm = require('./model-form/AttributeDictionaryForm').AttributeDictionaryForm;
var OperationTypeForm = require('./model-form/OperationTypeForm').OperationTypeForm;
var ResourceTypeForm = require('./model-form/ResourceTypeForm').ResourceTypeForm;
var UserRankForm = require('./model-form/UserRankForm').UserRankForm;
var PaymentKindForm = require('./model-form/PaymentKindForm').PaymentKindForm;
//组织架构模块
var DepartmentForm = require('./model-form/DepartmentForm').DepartmentForm;
var OrganizationForm = require('./model-form/OrganizationForm').OrganizationForm;
var EmployeeForm = require('./model-form/EmployeeForm').EmployeeForm;
//授权管理模块
var UserForm = require('./model-form/UserForm').UserForm;
var RoleForm = require('./model-form/RoleForm').RoleForm;
var UserGroupForm = require('./model-form/UserGroupForm').UserGroupForm;
var ResourceForm = require('./model-form/ResourceForm').ResourceForm;
var PermissionForm = require('./model-form/PermissionForm').PermissionForm;
var PermissionInRoleForm = require('./model-form/PermissionInRoleForm').PermissionInRoleForm;
var PermissionInUserForm = require('./model-form/PermissionInUserForm').PermissionInUserForm;
//商户管理模块
var CommentForm = require('./model-form/CommentForm').CommentForm;
var MemberForm = require('./model-form/MemberForm').MemberForm;
var StoreForm = require('./model-form/StoreForm').StoreForm;
var MerchantRankForm = require('./model-form/MerchantRankForm').MerchantRankForm;
var MemberRankForm = require('./model-form/MemberRankForm').MemberRankForm;
var MerchantForm = require('./model-form/MerchantForm').MerchantForm;
var AdvertisementForm = require('./model-form/AdvertisementForm').AdvertisementForm;
//服务管理模块
var ServiceSetForm = require('./model-form/ServiceSetForm').ServiceSetForm;
var ServiceItemForm = require('./model-form/ServiceItemForm').ServiceItemForm;
var PromotionRuleForm = require('./model-form/PromotionRuleForm').PromotionRuleForm;
var CouponForm = require('./model-form/CouponForm').CouponForm;
var MemberCardForm = require('./model-form/MemberCardForm').MemberCardForm;
var MeteringCardForm = require('./model-form/MeteringCardForm').MeteringCardForm;
var GiftForm = require('./model-form/GiftForm').GiftForm;
//积分管理模块
var MerchantPointForm = require('./model-form/MerchantPointForm').MerchantPointForm;
var UserPointForm = require('./model-form/UserPointForm').UserPointForm;
var MemberPointForm = require('./model-form/MemberPointForm').MemberPointForm;
var PointHistoryForm = require('./model-form/PointHistoryForm').PointHistoryForm;
//交易管理模块
var PlatformSellRecordForm = require('./model-form/PlatformSellRecordForm').PlatformSellRecordForm;
var SellRecordForm = require('./model-form/SellRecordForm').SellRecordForm;
var ConsumeRecordForm = require('./model-form/ConsumeRecordForm').ConsumeRecordForm;
var PaymentRecordForm = require('./model-form/PaymentRecordForm').PaymentRecordForm;
var LargessRecordForm = require('./model-form/LargessRecordForm').LargessRecordForm;
//杂项管理模块
var MessageForm = require('./model-form/MessageForm').MessageForm;
var ImageStoreForm = require('./model-form/ImageStoreForm').ImageStoreForm;
var OperationLogForm = require('./model-form/OperationLogForm').OperationLogForm;
var UserSettingForm = require('./model-form/UserSettingForm').UserSettingForm;
var GlobalSettingForm = require('./model-form/GlobalSettingForm').GlobalSettingForm;


exports.menuConfig = module.exports.menuConfig = {
  uriPrefix :[webRoot_sys, '/admin'].join(''),
  appModules:[
    {
      name       :'工作面板',
      description:'用户当前的常用任务列表',
      uriRoute   :'/dashboard',
      iconCode   :'icon-dashboard',
      menus      :[]
    },
    {
      name       :'基础数据',
      description:'系统使用的数据管理',
      uriRoute   :'/basement',
      iconCode   :'icon-coffee',
      menus      :[
        {
          name       :'AppKey',
          description:'开放接口的AppKey管理',
          uriRoute   :'/appkey',
          iconCode   :'icon-key',
          modelForm  :AppKeyForm,
          enabled    :true
        },
        {
          name       :'注册应用',
          description:'应用系统',
          uriRoute   :'/webapp',
          iconCode   :'icon-desktop',
          modelForm  :ApplicationForm,
          enabled    :true
        },
        {
          name       :'扩展属性',
          description:'扩展属性的数据字典管理',
          uriRoute   :'/dict',
          iconCode   :'icon-book',
          modelForm  :AttributeDictionaryForm,
          enabled    :true
        },
        {
          name       :'操作类型',
          description:'可用的页面操作类型，用于权限管理',
          uriRoute   :'/operation_type',
          iconCode   :'icon-check-minus',
          modelForm  :OperationTypeForm,
          enabled    :true
        },
        {
          name       :'资源类型',
          description:'可用的资源类型，用于权限管理',
          uriRoute   :'/resource_type',
          iconCode   :'icon-food',
          modelForm  :ResourceTypeForm,
          enabled    :true
        },
        {
          name       :'支付类型',
          description:'可以接受的支付方式',
          uriRoute   :'/payment_type',
          iconCode   :'icon-money',
          modelForm  :PaymentKindForm,
          enabled    :true
        },
        {
          name       :'用户等级',
          description:'用户的等级设定',
          uriRoute   :'/user_rank',
          iconCode   :'icon-magic',
          modelForm  :UserRankForm,
          enabled    :true
        }
      ]
    },
    {
      name       :'组织架构',
      description:'公司或单位的组织架构管理',
      uriRoute   :'/organ',
      iconCode   :'icon-sitemap',
      menus      :[
        {
          name       :'法人机构',
          description:'企业法人、国家机关法人、事业单位法人和社会团体法人',
          uriRoute   :'/list',
          iconCode   :'icon-beer',
          modelForm  :OrganizationForm,
          enabled    :true
        },
        {
          name       :'单位部门',
          description:'公司或单位的下属部门管理',
          uriRoute   :'/dept',
          iconCode   :'icon-puzzle-piece',
          modelForm  :DepartmentForm,
          enabled    :true
        },
        {
          name       :'员工资料',
          description:'公司或单位的雇员信息管理',
          uriRoute   :'/employee',
          iconCode   :'icon-user',
          modelForm  :EmployeeForm,
          enabled    :true
        }
      ]
    },
    {
      name       :'授权管理',
      description:'RBAC-基于角色的授权管理',
      uriRoute   :'/rbac',
      iconCode   :'icon-shield',
      menus      :[
        {
          name       :'用户', //注意绑定手机号, 所在用户组
          description:'用户信息管理',
          uriRoute   :'/user',
          iconCode   :'icon-user',
          modelForm  :UserForm,
          enabled    :true
        },
        {
          name       :'角色', //哪些用户具有该角色，UserInRole
          description:'角色信息管理',
          uriRoute   :'/role',
          iconCode   :'icon-umbrella',
          modelForm  :RoleForm,
          enabled    :true
        },
        {
          name       :'用户组', //组内用户, UserInGroup
          description:'用户分组管理',
          uriRoute   :'/user_group',
          iconCode   :'icon-group',
          modelForm  :UserGroupForm,
          enabled    :true
        },
        {
          name       :'可用资源',
          description:'可用资源管理',
          uriRoute   :'/resource',
          iconCode   :'icon-lightbulb',
          modelForm  :ResourceForm,
          enabled    :true
        },
        {
          name       :'资源许可',
          description:'可用资源所许可的操作管理',
          uriRoute   :'/permission',
          iconCode   :'icon-certificate',
          modelForm  :PermissionForm,
          enabled    :true
        },
        {
          name       :'用户授权',
          description:'用户操作资源的授权管理',
          uriRoute   :'/permission_user',
          iconCode   :'icon-bell',
          modelForm  :PermissionInUserForm,
          enabled    :true
        },
        {
          name       :'角色授权',
          description:'具备某种角色的用户操作资源的授权管理',
          uriRoute   :'/permission_role',
          iconCode   :'icon-bolt',
          modelForm  :PermissionInRoleForm,
          enabled    :true
        }
      ]
    },
    {
      name       :'商户管理',
      description:'在平台中注册的商户',
      uriRoute   :'/merchant',
      iconCode   :'icon-leaf',
      menus      :[
        {
          name       :'商户',
          description:'商户信息',
          uriRoute   :'/list',
          iconCode   :'icon-rocket',
          modelForm  :MerchantForm, enabled:true
        },
        {
          name       :'商户等级',
          description:'商户的等级设定',
          uriRoute   :'/merchant_rank',
          iconCode   :'icon-bookmark',
          modelForm  :MerchantRankForm, enabled:true
        },
        {
          name       :'门店',
          description:'商户的门店信息',
          uriRoute   :'/store',
          iconCode   :'icon-laptop',
          modelForm  :StoreForm, enabled:true
        },
        {
          name       :'会员',
          description:'商户的会员',
          uriRoute   :'/member',
          iconCode   :'icon-user-md',
          modelForm  :MemberForm, enabled:true
        },
        {
          name       :'会员等级',
          description:'会员的等级设定',
          uriRoute   :'/member_rank',
          iconCode   :'icon-bookmark-empty',
          modelForm  :MemberRankForm, enabled:true
        },
        {
          name       :'会员评论',
          description:'会员对商户的评论',
          uriRoute   :'/comment',
          iconCode   :'icon-comment',
          modelForm  :CommentForm, enabled:true
        },
        {
          name       :'促销活动',
          description:'发布促销广告信息',
          uriRoute   :'/ad',
          iconCode   :'icon-bullhorn',
          modelForm  :AdvertisementForm, enabled:true
        }
      ]
    },
    {
      name       :'服务管理',
      description:'商户在这里发布服务',
      uriRoute   :'/service',
      iconCode   :'icon-fire',
      menus      :[
        {
          name       :'服务套餐',
          description:'商户定义的服务套餐',
          uriRoute   :'/service_set',
          iconCode   :'icon-rss',
          modelForm  :ServiceSetForm, enabled:true
        },
        {
          name       :'服务项目',
          description:'套餐中的服务项目',
          uriRoute   :'/service_item',
          iconCode   :'icon-rocket',
          modelForm  :ServiceItemForm, enabled:true
        },
        {
          name       :'业务规则',
          description:'各种促销、活动、服务规则',
          uriRoute   :'/rule',
          iconCode   :'icon-superscript',
          modelForm  :PromotionRuleForm, enabled:true
        },
        {
          name       :'会员卡',
          description:'商户发出的会员卡',
          uriRoute   :'/member_card',
          iconCode   :'icon-credit-card',
          modelForm  :MemberCardForm, enabled:true
        },
        {
          name       :'计次卡',
          description:'商户发出的计次卡',
          uriRoute   :'/metering_card',
          iconCode   :'icon-list-ol',
          modelForm  :MeteringCardForm, enabled:true
        },
        {
          name       :'优惠券',
          description:'商户发出的优惠券',
          uriRoute   :'/coupon',
          iconCode   :'icon-ticket',
          modelForm  :CouponForm, enabled:true
        },
        {
          name       :'赠品及礼品',
          description:'商户发出的赠品及礼品',
          uriRoute   :'/gift',
          iconCode   :'icon-gift',
          modelForm  :GiftForm, enabled:true
        }
      ]
    },
    {
      name       :'积分管理',
      description:'用户积分、会员积分、商户积分',
      uriRoute   :'/point',
      iconCode   :'icon-tint',
      menus      :[
        {
          name       :'商户积分',
          description:'商户在平台的积分',
          uriRoute   :'/merchant',
          iconCode   :'icon-star',
          modelForm  :MerchantPointForm, enabled:true
        },
        {
          name       :'用户积分',
          description:'用户在平台的积分',
          uriRoute   :'/user',
          iconCode   :'icon-star-empty',
          modelForm  :UserPointForm, enabled:true
        },
        {
          name       :'会员积分',
          description:'用户在某个商户的积分',
          uriRoute   :'/member',
          iconCode   :'icon-star-half-empty',
          modelForm  :MemberPointForm, enabled:true
        },
        {
          name       :'积分历史',
          description:'平台积分历史记录',
          uriRoute   :'/history',
          iconCode   :'icon-star-half',
          modelForm  :PointHistoryForm, enabled:true
        }
      ]
    },
    {
      name       :'交易管理',
      description:'销售、支付、消费等交易相关的业务管理',
      uriRoute   :'/deal',
      iconCode   :'icon-shopping-cart',
      menus      :[
        {
          name       :'平台销售记录',
          description:'商户的服务销售情况',
          uriRoute   :'/platform_sell',
          iconCode   :'icon-tasks',
          modelForm  :PlatformSellRecordForm, enabled:true
        },
        {
          name       :'商户销售记录',
          description:'商户的服务销售情况',
          uriRoute   :'/sell',
          iconCode   :'icon-tags',
          modelForm  :SellRecordForm, enabled:true
        },
        {
          name       :'会员消费记录',
          description:'会员的消费记录',
          uriRoute   :'/consume',
          iconCode   :'icon-money',
          modelForm  :ConsumeRecordForm, enabled:true
        },
        {
          name       :'支付记录',
          description:'会员消费商户服务或商户购买平台服务产生的支付记录',
          uriRoute   :'/payment',
          iconCode   :'icon-tag',
          modelForm  :PaymentRecordForm, enabled:true
        },
        {
          name       :'转赠记录',
          description:'会员转赠服务的记录',
          uriRoute   :'/largess',
          iconCode   :'icon-hand-right',
          modelForm  :LargessRecordForm, enabled:true
        }
      ]
    },
    {
      name       :'杂项管理',
      description:'消息、设置、图片的管理',
      uriRoute   :'/others',
      iconCode   :'icon-indent-right',
      menus      :[
        {
          name       :'消息管理', //Message, MessageSendRecord
          description:'消息的发送记录',
          uriRoute   :'/message',
          iconCode   :'icon-comments',
          modelForm  :MessageForm, enabled:true
        },
        {
          name       :'操作日志',
          description:'记录级的操作记录',
          uriRoute   :'/log',
          iconCode   :'icon-keyboard',
          modelForm  :OperationLogForm, enabled:true
        },
        {
          name       :'图片记录',
          description:'上传的图片记录',
          uriRoute   :'/image',
          iconCode   :'icon-picture',
          modelForm  :ImageStoreForm, enabled:true
        },
        {
          name       :'系统设置',
          description:'系统的全局参数设置',
          uriRoute   :'/global_setting',
          iconCode   :'icon-align-right',
          modelForm  :GlobalSettingForm, enabled:true
        },
        {
          name       :'用户设置',
          description:'用户特定的参数设置',
          uriRoute   :'/user_setting',
          iconCode   :'icon-align-left',
          modelForm  :UserSettingForm, enabled:true
        }
      ]
    }
  ]
};