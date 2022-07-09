const axios = require("axios");
const cheerio = require("cheerio");
const extractNumbers = require("extract-numbers");

const { Source, Manga, Chapter, Section } = require("../models");
const { decodeHTMLEntity } = require("./parsers/blogtruyen");

const { proxyImage } = require("../utils/image");

const NhentaiSource = new Source({
    name: 'nhentai',
    baseURL: 'https://nhentai.net',
    icon: 'https://static.nhentai.net/img/logo.090da3be7b51.svg'
})

const CORS_URL = "https://cubari.moe";

NhentaiSource.parseURL = (url) => {
    url = url.replace(/https:\/\//g, "").replace(/http:\/\//g, "").replace(/www\./g, "");
    url = url.split("?")[0];
    if (/^nhentai\.net\/g\/[0-9]{1,6}(\/|$)/.test(url)) return { sourceName: NhentaiSource.name, mangaId: url.split("/")[2] };
    return "";
}

NhentaiSource.getMangaShareURL = (mangaId) => `${NhentaiSource.baseURL}/g/${mangaId}`;

NhentaiSource.getChapterShareURL = (mangaId, chapterId) => `${NhentaiSource.baseURL}/g/${chapterId}`;

NhentaiSource.createRequest = axios.create(({
    baseURL: CORS_URL,
    timeout: 20000,
    method: 'get',
}))

NhentaiSource.getMangaDetails = async (mangaId) => {
    const { data: html } = await NhentaiSource.createRequest({
        url: `/read/nhentai/${mangaId}`,
    })

    const $ = cheerio.load(html);

    const chapters = {
        1: {
            id: 1,
            title: $('.chapter-title').text(),
            time: new Date(...JSON.parse($('.detailed-chapter-upload-date').text().trim()))
        }
    }

    return new Manga({
        id: mangaId,
        authors: [$('.table.table-borderless.table-sm.small td.text-sm').text().trim()],
        desc: "",
        titles: [$('content h1').text().trim(), $('content p').text().trim()],
        cover: $('img.img-fluid').attr('src'),
        source: NhentaiSource,
        shareURL: NhentaiSource.getMangaShareURL(mangaId),
        chapters,
    })
}

NhentaiSource.getChapterDetails = async (mangaId, chapterId) => {
    const { data } = await NhentaiSource.createRequest({
        url: `/read/api/nhentai/series/${mangaId}`,
    })

    return {
        pages: data.chapters[1]['groups'][1],
        longStrip: false
    };
}

NhentaiSource.getHomepageSections = async () => {
    let html = "";
    let TRY_COUNT = 3;
    while (!html && TRY_COUNT > 0) {
        try {
            const { data } = await axios({
                url: `https://services.f-ck.me/v2/cors/aHR0cHM6Ly9uaGVudGFpLm5ldC8=?source=proxy_cubari_moe`,
                headers: {
                    "origin": "cubari",
                    "x-requested-with": "cubari"
                }
            })
            html = data;
        } catch (error) {
            html = ""
            TRY_COUNT--;
            console.log(TRY_COUNT);
        }
    }
    const $ = cheerio.load(html);

    const hot = new Section({
        id: 'hot',
        name: 'Cực lứng'
    })

    //New Updates
    let hotItems = [];

    for (let obj of $('.index-popular .gallery').toArray()) {
        let title = $(`.caption`, obj).text().trim();
        const id = $(`a`, obj).attr('href').split("/")[2];
        let cover = $(`img.lazyload`, obj).attr('src');
        // if (!id || !subtitle) continue;
        hotItems.push(new Manga({
            id: id,
            cover: proxyImage(cover),
            titles: [title, ""],
        }))
    }

    hot.mangas = hotItems;

    return [hot];
}

module.exports = NhentaiSource;