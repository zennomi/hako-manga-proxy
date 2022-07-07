const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const sources = require('../sources');

const injectSource = (req, res, next) => {
    req.source = sources[req.params.source];
    if (!req.source) return next(new ApiError(httpStatus.BAD_REQUEST, 'source error'));
    return next();
}

module.exports = { injectSource };