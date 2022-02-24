const { join } = require('path');
const { promises, createReadStream } = require('fs');
const { load } = require('cheerio');
const htmlparser = require('htmlparser2');

/* quick'n'dirty way to snapshot data to the dataset */
exports.dataSnapshotter = () => {
    if (!process.env.SNAPSHOT) {
        return {
            set() {},
            save() {},
        };
    }

    process.env.APIFY_LOCAL_STORAGE_DIR = join(__dirname, '..', 'apify_storage');
    const Apify = require('apify'); // eslint-disable-line global-require

    const state = {};

    return {
        set(type, key, value) {
            if (!state[type]) {
                state[type] = {};
            }
            state[type][key] = value;
        },
        async save() {
            await Apify.pushData(state);
        },
    };
};

exports.loadFixtureFile = (name) => promises.readFile(
    join(__dirname, 'html', name), { encoding: 'utf8' },
);

exports.loadFixtureHtmlWithCheerio = async (name) => {
    return new Promise((resolve, reject) => {
        const domHandler = new htmlparser.DomHandler((err, dom) => {
            if (err) reject(err);
            else resolve(dom);
        });
        const parser = new htmlparser.Parser(domHandler, { decodeEntities: true });

        createReadStream(join(__dirname, 'html', `${name}.html`))
            .once('error', reject)
            .pipe(parser);
    }).then((dom) => load(dom));
};

exports.loadPair = async (name) => ({
    $: await exports.loadFixtureHtmlWithCheerio(name),
    json: JSON.parse(await exports.loadFixtureFile(`${name}.json`)),
});
