const axios = require("axios");
const cheerio = require("cheerio");
const extractNumbers = require("extract-numbers");
const { parse } = require("date-fns");
const { vi } = require("date-fns/locale")

const { Source, Manga, Chapter, Section } = require("../models");
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
    if (/^lxhentai\.com\/truyen\/([a-z0-9]{1,9})(-[a-z0-9]{1,9}){0,6}(\/|$)/.test(url)) return { sourceName: LxhSource.name, mangaId: url.split("/")[2] };
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
    let nullChapterNumberCount = 0;
    for (const obj of $("a", "ul.overflow-y-auto.overflow-x-hidden").toArray()) {
        let title = $('.text-ellipsis', obj).text().trim();
        let id = $(obj).attr('href').split("/")[3];
        const chapterNumbers = extractNumbers(title);
        const chapterNumber = chapterNumbers && chapterNumbers.length > 0 ? chapterNumbers[0] : `0.${nullChapterNumberCount++}`;
        chapters[id] = (new Chapter({
            id: id,
            title,
            number: chapterNumber,
            time: parse($('.timeago.ml-2.whitespace-nowrap', obj).attr('datetime'), 'yyyy-MM-dd HH:mm:ss', new Date(), { options: { locale: vi } }),
            shareURL: LxhSource.getChapterShareURL(mangaId, id)
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

LxhSource.getHomepageSections = async () => {
    const { data: html } = await LxhSource.createRequest({
        url: `/`,
    })
    const $ = cheerio.load(html);

    const hot = new Section({
        id: 'hot',
        title: 'Truyện hot'
    })

    //New Updates
    let hotItems = [];

    for (let obj of $('.border.rounded-lg.border-gray-300.bg-white.manga-vertical').toArray()) {
        let title = $('.p-2.w-full.truncate', obj).text().trim();
        let subtitle = $('.latest-chapter.truncate', obj).text().trim();
        let cover = $('.rounded-t-lg.cover', obj).css('background-image');
        cover = /^url\((['"]?)(.*)\1\)$/.exec(cover);
        cover = cover ? cover[2] : ""; // If matched, retrieve url, otherwise ""

        let id = $('div:nth-child(1) > a', obj).attr('href').split("/")[2];
        // if (!id || !subtitle) continue;
        hotItems.push(new Manga({
            id: id,
            cover: !cover ? "https://i.imgur.com/GYUxEX8.png" : encodeURI(cover),
            titles: [title, subtitle],
        }))
    }

    hot.mangas = hotItems;

    return { [hot.id]: hot };
}

module.exports = LxhSource;