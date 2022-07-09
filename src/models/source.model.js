class Source {
    name = "";
    baseURL = "";
    icon = "";
    sections = [];
    createRequest;
    getMangaDetails;
    getSection;
    getMangaShareURL;
    getChapterShareURL;
    getChapterDetails;
    parseURL;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Source;