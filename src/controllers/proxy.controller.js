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

const getHomepageSections = catchAsync(async (req, res) => {
  const sections = await req.source.getHomepageSections();
  if (!sections) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sections not found');
  }
  res.send(sections);
});

const parseURL = catchAsync(async (req, res) => {
  let result = "";
  for (const source of Object.values(sources)) {
    result = source.parseURL(req.query.url);
    if (result) break;
  }
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'URL is not valid');
  }
  res.send(result);
});

module.exports = {
  getSource,
  getManga,
  getChapter,
  getHomepageSections,
  parseURL,
};
