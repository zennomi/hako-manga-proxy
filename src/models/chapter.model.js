class Chapter {
    id = "";
    title = "";
    shareURL = "";
    time = "";
    number = 0;
    pages = [];
    longStrip = false;
    constructor(object) {
        Object.assign(this, object);
    }
}

module.exports = Chapter;