class Source {
    name;
    baseURL;
    icon;
    sections = [];
    createRequest;
    getMangaDetails;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Source;