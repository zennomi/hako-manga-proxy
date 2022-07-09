class Manga {
    id = "";
    titles = [];
    desc = "";
    authors = [];
    artists = [];
    cover = "";
    tags = [];
    status = 0;
    source;
    shareURL = "";
    chapters = {};
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Manga;