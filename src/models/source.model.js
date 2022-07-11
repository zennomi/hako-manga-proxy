const redisClient = require("../config/redis");

class Source {
    name = "";
    baseURL = "";
    icon = "";
    createRequest;
    getMangaDetails;
    getChapterDetails;
    getHomepageSections;
    getMangaShareURL;
    getChapterShareURL;
    parseURL;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Source;