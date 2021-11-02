const mobile = require('../src/extractors/mobile');
const { loadFixtureHtmlWithCheerio, loadPair, dataSnapshotter } = require('./utils');

const snapshot = dataSnapshotter();

describe('mobile extractors', () => {
    /* eslint-disable no-loop-func */

    afterAll(async () => {
        await snapshot.save();
    });

    for (const type of [
        'mobile',
        'weblight',
        'weblight2',
        'desktop-like',
        'desktop-like2',
    ]) {
        describe(`${type}`, () => {
            test('determineLayout', async () => {
                const html = await loadFixtureHtmlWithCheerio(type);
                expect(mobile.determineLayout(html)).toEqual(type.replace(/\d/, ''));
            });

            test('extractOrganicResults', async () => {
                const { $, json } = await loadPair(type);
                const results = mobile.extractOrganicResults($, 'www.google.com');

                snapshot.set(type, 'organicResults', results);

                expect(results).toEqual(json.organicResults);
            });

            test('extractPaidProducts', async () => {
                const { $, json } = await loadPair(type);
                const results = mobile.extractPaidProducts($, 'www.google.com');

                snapshot.set(type, 'paidProducts', results);

                expect(results).toEqual(json.paidProducts);
            });

            test('extractPaidResults', async () => {
                const { $, json } = await loadPair(type);
                const results = mobile.extractPaidResults($, 'www.google.com');

                snapshot.set(type, 'paidResults', results);

                expect(results).toEqual(json.paidResults);
            });

            test('extractRelatedQueries', async () => {
                const { $, json } = await loadPair(type);
                const results = mobile.extractRelatedQueries($, 'www.google.com');

                snapshot.set(type, 'relatedQueries', results);

                expect(results).toEqual(json.relatedQueries);
            });
        });
    }
});
