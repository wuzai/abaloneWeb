var Comment = require('../../model/Comment').Comment;
var commentServer = require('../../services/comment-service');

var commentList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  commentServer.findCommentListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/commentList', {merchantId:merchantId, comments:result.comments});
  });
};

module.exports = {
  commentList:commentList
};