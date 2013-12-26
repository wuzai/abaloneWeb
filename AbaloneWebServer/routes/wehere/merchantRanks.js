var MerchantRank = require('../../model/MerchantRank').MerchantRank;

var merchantRankPage = function (req, res) {
  MerchantRank.find({state:'0000-0000-0000'},function (err, merchantRankList) {
    res.render('wehere/merchantRank', {merchantRanks:merchantRankList});
  }).sort({updatedAt:-1}).limit(4);
};

module.exports = {
  merchantRankPage:merchantRankPage
};