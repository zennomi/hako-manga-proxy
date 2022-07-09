class Source {
    name = "";
    baseURL = "";
    icon = "";
    createRequest;
    getMangaDetails;
    getHomepageSections;
    getMangaShareURL;
    getChapterShareURL;
    getChapterDetails;
    parseURL;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Source;