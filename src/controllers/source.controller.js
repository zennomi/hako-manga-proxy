const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const sources = require("../sources");

const getSource = catchAsync(async (req, res) => {
  const source = sources[req.params.source];
  if (!source) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Source not found');
  }
  res.send(source);
});

module.exports = {
    getSource,
};
