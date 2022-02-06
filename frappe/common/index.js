const utils = require('../utils');
const format = require('../utils/format');
const errors = require('./errors');
const BaseDocument = require('esaint/model/document');
const BaseMeta = require('esaint/model/meta');

module.exports = {
  initLibs(esaint) {
    Object.assign(esaint, utils);
    Object.assign(esaint, format);
    esaint.errors = errors;
    esaint.BaseDocument = BaseDocument;
    esaint.BaseMeta = BaseMeta;
  },
};
