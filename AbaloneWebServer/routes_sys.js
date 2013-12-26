var index = require('./routes/sys/index');

exports = module.exports = function (app) {
  //后台系统管理web端
  app.get(['' , '/admin/dashboard'].join(''), index.index);

  app.get('/exit', function (req, res) {
    res.json(200, {message:'server closed'});
    process.exit(0);
  });
};