const axios = require("axios");
const cheerio = require("cheerio");
const extractNumbers = require("extract-numbers");

const { Source, Manga, Chapter } = require("../models");
// const { decodeHTMLEntity } = require("./parsers/lxhentai");

const { proxyImage } = require("../utils/image");

const LxhSource = new Source({
    name: 'lxhentai',
    baseURL: 'https://lxhentai.com',
    icon: 'https://lxhentai.com/favicon.ico',
})

LxhSource.parseURL = (url) => {
    url = url.replace(/https:\/\//g, "").replace(/http:\/\//g, "").replace(/www\./g, "");
    url = url.split("?")[0];
    if (/^lxhentai\.com\/truyen\/([a-z0-9]{1,9})(-[a-z0-9]{1,9}){1,6}(\/|$)/.test(url)) return { sourceName: LxhSource.name, mangaId: url.split("/")[2] };
    return "";
}

LxhSource.getMangaShareURL = (mangaId) => `${LxhSource.baseURL}/truyen/${mangaId}`;

LxhSource.getChapterShareURL = (mangaId, chapterId) => `${LxhSource.baseURL}/${chapterId}/zennomi`;

LxhSource.createRequest = axios.create(({
    baseURL: LxhSource.baseURL,
    timeout: 20000,
    // headers: { 'referer': LxhSource.baseURL },
    method: 'get',
}))

LxhSource.getMangaDetails = async (mangaId) => {

    const { data: html } = await LxhSource.createRequest({
        url: `/truyen/${mangaId}`,
        method: 'get'
    })

    const $ = cheerio.load(html);

    let tags = [];
    let authors = [];
    let status = 0;
    let artists = '';
    let desc = $('.detail-content > p').text();
    let titles = [$('span.grow.text-lg.ml-1.text-ellipsis.font-semibold').first().text()];
    let cover = $('.rounded-lg.cover').css('background-image');
    cover = /^url\((['"]?)(.*)\1\)$/.exec(cover);
    cover = cover ? cover[2] : ""; // If matched, retrieve url, otherwise ""

    for (const a of $('.mt-2 > .text-gray-500.mr-2.font-semibold').toArray()) {
        switch ($(a).text().trim()) {
            case "Tác giả:":
                authors = [$(a).next().text()];
                break;
            case "Tình trạng:":
                status = $(a).next().text().toLowerCase().includes("đã") ? 1 : 0;
                break;
            case "Thể loại:":
                for (const t of $('a', $(a).next()).toArray()) {
                    const genre = $(t).text().trim()
                    tags.push(genre);
                }
                break;
        }
    }

    const chapters = {};
    for (const obj of $("a", "ul.overflow-y-auto.overflow-x-hidden").toArray()) {
        let title = $('.text-ellipsis', obj).text().trim();
        let id = $(obj).attr('href').split("/")[3];

        chapters[id] = (new Chapter({
            id: id,
            title,
            number: extractNumbers(title),
            time: $('.timeago.ml-2.whitespace-nowrap', obj).attr('datetime')
        }));
    }

    return new Manga({
        id: mangaId,
        authors: authors,
        desc: desc,
        titles,
        cover,
        status,
        tags,
        source: LxhSource,
        shareURL: LxhSource.getMangaShareURL(mangaId),
        chapters
    })
}

LxhSource.getChapterDetails = async (mangaId, chapterId) => {
    const { data: html } = await LxhSource.createRequest({
        url: `/truyen/${mangaId}/${chapterId}`,
    })
    const $ = cheerio.load(html);

    const pages = [];

    const list = $('img', '.max-w-7xl.mx-auto.px-3.w-full.mt-6 .text-center').toArray();

    for (let obj of list) {
        let link = obj.attribs['src'];
        pages.push(encodeURI(link));
    }

    return {
        pages: pages,
        longStrip: true
    };
}

module.exports = LxhSource;