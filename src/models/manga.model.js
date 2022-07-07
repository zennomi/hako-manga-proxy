class Manga {
    id;
    titles;
    desc;
    authors = [];
    artists = [];
    cover;
    tags = [];
    status = 0;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Manga;