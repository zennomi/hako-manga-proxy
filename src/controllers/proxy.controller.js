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

const getManga = catchAsync(async (req, res) => {
  const manga = await req.source.getMangaDetails(req.params.mangaId);
  if (!manga) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manga not found');
  }
  res.send(manga);
});

const getChapter = catchAsync(async (req, res) => {
  const chapterDetails = await req.source.getChapterDetails(req.params.mangaId, req.params.chapterId);
  if (!chapterDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chapter not found');
  }
  res.send(chapterDetails);
});

module.exports = {
    getSource,
    getManga,
    getChapter,
};
