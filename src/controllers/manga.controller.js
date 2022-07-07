const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getManga = catchAsync(async (req, res) => {
  const manga = await req.source.getMangaDetails(req.params.mangaId);

  if (!manga) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manga not found');
  }
  res.send(manga);
});

module.exports = {
    getManga,
};
