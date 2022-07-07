const { Source, Manga } = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
const { decodeHTMLEntity } = require("./parsers/Blogtruyen");

const BltSource = new Source({
    name: 'Blogtruyen',
    baseURL: 'https://blogtruyen.vn',
    icon: 'https://pbs.twimg.com/profile_images/1132494241/favicon_400x400.png',
    sections: ['featured', 'hot', 'new_updated', ]
})

BltSource.createRequest = axios.create(({
    baseURL: BltSource.baseURL,
    timeout: 20000,
    headers: { 'referer': BltSource.baseURL },
    method: 'get',
}))

BltSource.getMangaDetails = async (mangaId) => {
    console.log(mangaId);
    const { data: html } = await BltSource.createRequest({
        url: `/${mangaId}`,
    })
    const $ = cheerio.load(html);
    let author = '';
    let status = 1;
    let desc = $('.content').text();
    let tags = [];
    let titles = [decodeHTMLEntity($('.entry-title > a').text().trim())];

    for (const test of $('p', '.description').toArray()) {
        switch ($(test).clone().children().remove().end().text().trim()) {
            case 'Tên khác:':
                titles.push(decodeHTMLEntity($('.color-red', test).text().trim()));
                break;
            case 'Tác giả:':
                author = decodeHTMLEntity($('a', test).text());
                break;
            case 'Thể loại:':
                for (const t of $('.category > a', test).toArray()) {
                    const genre = $(t).text().trim()
                    const id = $(t).attr('href') ?? genre
                    tags.push(genre.toLowerCase());
                }
                status = $('.color-red', $(test).next()).text().toLowerCase().includes("đang") ? 0 : 1;
                break;
            default:
                break;
        }
    }
    const cover = $('.thumbnail > img').attr('src') ?? "";

    return new Manga({
        id: mangaId,
        authors: [author],
        desc: desc,
        titles,
        cover: encodeURI(cover),
        status,
        tags
    })
}

module.exports = BltSource;