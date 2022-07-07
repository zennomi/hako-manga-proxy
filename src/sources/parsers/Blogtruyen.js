const entities = require("entities"); //Import package for decoding HTML entities (unescape string)

module.exports.generateSearch = (query) => {
    let keyword = query.title ?? "";
    return encodeURI(keyword);
}

module.exports.parseSearch = ($) => {
    const collectedIds = [];
    const mangas = [];
    for (let obj of $('p:not(:first-child)', '.list').toArray()) {
        let title = $(`a`, obj).text().trim();
        let subtitle = 'Chương ' + $(`span:nth-child(2)`, obj).text().trim();
        const image = $('img', $(obj).next()).attr('src') ?? "";
        let id = $(`a`, obj).attr('href') ?? title;
        if (!collectedIds.includes(id)) { //ko push truyện trùng nhau
            mangas.push(createMangaTile({
                id: encodeURI(id),
                image: encodeURI(image.replace('150x', '300x300')),
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
    }
    return mangas;
}

module.exports.parseViewMore = ($, select) => {
    const manga = [];
    const collectedIds = [];
    if (select === 1) {
        for (let obj of $('.row', '.list-mainpage .storyitem').toArray()) {
            let title = $(`h3.title > a`, obj).text().trim();
            let subtitle = $(`div:nth-child(2) > div:nth-child(4) > span:nth-child(1) > .color-red`, obj).text();
            const image = $(`div:nth-child(1) > a > img`, obj).attr('src');
            let id = $(`div:nth-child(1) > a`, obj).attr('href') ?? title;
            if (!collectedIds.includes(id)) { //ko push truyện trùng nhau
                manga.push(createMangaTile({
                    id: id,
                    image: !image ? "https://i.imgur.com/GYUxEX8.png" : encodeURI(image),
                    title: createIconText({ text: decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: 'Chương ' + subtitle }),
                }));
                collectedIds.push(id);
            }
        }
    } else {
        for (let obj of $('p:not(:first-child)', '.list').toArray()) {
            let title = $(`a`, obj).text().trim();
            let subtitle = 'Chương ' + $(`span:nth-child(2)`, obj).text().trim();
            const image = $('img', $(obj).next()).attr('src') ?? "";
            let id = $(`a`, obj).attr('href') ?? title;
            if (!collectedIds.includes(id)) { //ko push truyện trùng nhau
                manga.push(createMangaTile({
                    id: id,
                    image: encodeURI(image.replace('150x', '300x300')),
                    title: createIconText({
                        text: decodeHTMLEntity(title),
                    }),
                    subtitleText: createIconText({
                        text: subtitle,
                    }),
                }))
                collectedIds.push(id);
            }
        }
    }
    return manga;
}

module.exports.isLastPage = ($) => {
    let isLast = false;
    const pages = [];

    for (const page of $("a", "ul.pagination > li").toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p)) continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($("ul.pagination > li > select > option").find(":selected").text().split(' ')[1]);
    if (currentPage >= lastPage) isLast = true;
    return isLast;
}

module.exports.decodeHTMLEntity = (str) => {
    return entities.decodeHTML(str);
}

// decodeHTMLEntity(str) { //hàm của bato.to
//     return str.replace(/&#(\d+);/g, function (match, dec) {
//         return String.fromCharCode(dec);
//     })
// }

