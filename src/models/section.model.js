class Section {
    id = "";
    title = "";
    mangas = [];
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Section;