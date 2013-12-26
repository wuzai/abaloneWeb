/**
 * express-restify-mongoose.js
 *
 * Copyright (C) 2013 by Florian Holzapfel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 **/
var util = require('util');

var restify = function (app, model, options) {
  if (!options) {
    options = { };
  }
  if (!options.prefix) {
    options.prefix = "/api";
  }
  if (!options.version) {
    options.version = "/v1";
  }

  var uri_items = util.format('%s%s/%ss', options.prefix, options.version, model.modelName);
  var uri_item = util.format('%s%s/%ss/:id', options.prefix, options.version, model.modelName);

  function buildQuery(query, options) {
    var skip = options.skip;
    var limit = options.limit;
    var sort = options.sort;
    var populate = options.populate;

    delete options.skip;
    delete options.limit;
    delete options.sort;
    delete options.populate;

    for (var key in options) {
      query.where(key);

      var value = options[key];
      if ('>' == value[0]) {
        if ('=' == value[1]) {
          query.gte(value.substr(2));
        } else {
          query.gt(value.substr(1));
        }
      }
      else if ('<' == value[0]) {
        if ('=' == value[1]) {
          query.lte(value.substr(2));
        } else {
          query.lt(value.substr(1));
        }
      } else {
        query.equals(value);
      }
    }

    if (skip) {
      query.skip(skip);
    }
    if (limit) {
      query.limit(limit);
    }
    if (sort) {
      query.sort(sort);
    }
    if (populate) {
      var arr = populate.split(',');
      for (var i = 0; i < arr.length; ++i) {
        query = query.populate(arr[i]);
      }
    }

    return query;
  }

  function ensureContentType(req, res, next) {
    var ct = req.get('Content-Type');
    if (ct != 'application/json') {
      res.send(400, 'Bad request');
    } else {
      next();
    }
  }

  app.get(uri_items, function (req, res) {
    buildQuery(model.find(), req.query).exec(function (err, items) {
      if (err) {
        res.send(400, 'Bad request');
      } else {
        res.type('json');
        res.send(JSON.stringify(items));
      }
    });
  });
  app.post(uri_items, ensureContentType, function (req, res) {
    model.create(req.body, function (err, item) {
      if (err) {
        res.send(400, 'Bad request');
      } else {
        res.type('json');
        res.send(201, JSON.stringify(item));
      }
    });
  });
  app.delete(uri_items, function (req, res) {
    buildQuery(model.find(), req.query).remove(function (err) {
      if (err) {
        res.send(400, 'Bad request');
      } else {
        res.send(200, 'Ok');
      }
    });
  });
  app.get(uri_item, function (req, res) {
    model.findById(res.req.param('id'), function (err, item) {
      if (err) {
        res.send(404, 'Not found');
      } else {
        res.type('json');
        res.send(JSON.stringify(item));
      }
    });
  });
  app.put(uri_item, ensureContentType, function (req, res) {
    model.update({ _id:res.req.param('id') }, req.body, function (err, numberAffected, raw) {
      if (err) {
        res.send(404, 'Not found');
      } else {
        res.send(200, 'Ok');
      }
    });
  });
  app.delete(uri_item, function (req, res) {
    model.remove({ _id:res.req.param('id') }, function (err) {
      if (err) {
        res.send(404, 'Not found');
      } else {
        res.send(200, 'Ok');
      }
    });
  });
};

module.exports.serve = restify;
