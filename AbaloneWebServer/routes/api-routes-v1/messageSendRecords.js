var config = require('../../config');
var Message = require('../../model/Message.js').Message;
var User = require('../../model/User.js').User;
var MessageSendRecord = require('../../model/MessageSendRecord').MessageSendRecord;
var ObjectId = require('mongoose').Types.ObjectId;

//获取会员的信息记录列表
var list = function (req, res, next) {
  var query = req.query;
  var user_id = query.user_id;
  var toUserId = new ObjectId(user_id);
  User.findById(toUserId, function (err, user) {
    if (err) return next(err);
    if (user) {
      var con_query = {
        toUser:toUserId,
        state :'0000-0000-0000'
      };
      if (query.timestamp) {
        var updatedAt = new Date(query.timestamp);
        if (updatedAt) {
          con_query.updatedAt = {$gte:updatedAt};
        }
      }
      var fields = '_id hasRead toUser message createdAt';
      MessageSendRecord.find(con_query, fields).sort({createdAt:-1}).populate('message', 'title content iconImage store merchant').exec(function (err, messageSendRecordList) {
        if (err) return next(err);
        var messageSendRecords = [];
        messageSendRecordList.forEach(function (messageSendRecord) {
          if (messageSendRecord && messageSendRecord.message) {
            var messageRecord_data = {
              _id           :messageSendRecord._id,
              title         :messageSendRecord.message.title,
              content       :messageSendRecord.message.content,
              iconImage     :[config.webRoot, config.imageRoot , messageSendRecord.message.iconImage].join(''),
              toUserId      :messageSendRecord.toUser,
              fromStoreId   :messageSendRecord.message.store,
              fromMerchantId:messageSendRecord.message.merchant,
              sentTime      :messageSendRecord.createdAt
            }
            messageSendRecords.push(messageRecord_data);
          }
        });
        res.json(200, messageSendRecords);
      });
    } else {
      res.json(404, {errors:'user not found'});
      return;
    }
  });
};

var deleteAllMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var user_id = query.user_id;
  var userId = new ObjectId(user_id);
  MessageSendRecord.update({toUser:userId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.json(200, {});
    return;
  });
};

var deleteMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var messageSendRecord_id = query.sendMessageRecord_id;
  var messageSendRecordId = new ObjectId(messageSendRecord_id);
  MessageSendRecord.update({_id:messageSendRecordId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.json(200, {});
    return;
  });
};

module.exports = {
  list                       :list,
  deleteAllMessageSendRecords:deleteAllMessageSendRecords,
  deleteMessageSendRecords   :deleteMessageSendRecords
};