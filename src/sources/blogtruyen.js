const axios = require("axios");
const cheerio = require("cheerio");
const extractNumbers = require("extract-numbers");

const { Source, Manga, Chapter } = require("../models");
const { decodeHTMLEntity } = require("./parsers/blogtruyen");

const { proxyImage } = require("../utils/image");

const BltSource = new Source({
    name: 'blogtruyen',
    baseURL: 'https://blogtruyen.vn',
    icon: 'https://pbs.twimg.com/profile_images/1132494241/favicon_400x400.png'
})

BltSource.parseURL = (url) => {
    url = url.replace(/https:\/\//g, "").replace(/http:\/\//g, "").replace(/www\./g, "");
    url = url.split("?")[0];
    if (/^blogtruyen\.vn\/[0-9]{1,6}(\/|$)/.test(url)) return { sourceName: BltSource.name, mangaId: url.split("/")[1] };
    return "";
}

BltSource.getMangaShareURL = (mangaId) => `${BltSource.baseURL}/${mangaId}`;

BltSource.getChapterShareURL = (mangaId, chapterId) => `${BltSource.baseURL}/${chapterId}/zennomi`;

BltSource.createRequest = axios.create(({
    baseURL: BltSource.baseURL,
    timeout: 20000,
    headers: { 'referer': BltSource.baseURL },
    method: 'get',
}))

BltSource.getMangaDetails = async (mangaId) => {

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
                    tags.push(genre.toLowerCase());
                }
                status = $('.color-red', $(test).next()).text().toLowerCase().includes("đang") ? 0 : 1;
                break;
            default:
                break;
        }
    }
    const cover = $('.thumbnail > img').attr('src') ?? "";

    const chapters = {};

    for (const obj of $("#list-chapters > p").toArray()) {
        const getTime = $('.publishedDate', obj).text().trim().split(' ');
        const time = {
            date: getTime[0],
            time: getTime[1]
        }
        const arrDate = time.date.split(/\//);
        const fixDate = [arrDate[1], arrDate[0], arrDate[2]].join('/');
        const finalTime = new Date(fixDate + ' ' + time.time);

        let nullChapterNumberCount = 0;
        const id = $('span.title > a', obj).first().attr('href').split("/")[1];
        const title = decodeHTMLEntity($('span.title > a', obj).text().trim());
        const chapterNumbers = extractNumbers(title);
        const chapterNumber = chapterNumbers && chapterNumbers.length > 0 ? chapterNumbers[0] : `0.${nullChapterNumberCount++}`;
        chapters[id] = new Chapter({
            id: id,
            title,
            time: finalTime,
            number: (chapterNumber),
            shareURL: BltSource.getChapterShareURL(mangaId, id)
        });
    }

    return new Manga({
        id: mangaId,
        authors: [author],
        desc: desc,
        titles,
        cover: encodeURI(cover),
        status,
        tags,
        source: BltSource,
        shareURL: BltSource.getMangaShareURL(mangaId),
        chapters
    })
}

BltSource.getChapterDetails = async (mangaId, chapterId) => {
    const { data: html } = await BltSource.createRequest({
        url: `/${chapterId}/mangaId`,
    })
    const $ = cheerio.load(html);
    const pages = [];

    for (let obj of $('#content > img').toArray()) {
        if (!obj.attribs['src']) continue;
        let link = obj.attribs['src'];
        pages.push(proxyImage(link, BltSource.baseURL));
    }

    return {
        pages: pages,
        longStrip: false
    };
}

module.exports = BltSource;