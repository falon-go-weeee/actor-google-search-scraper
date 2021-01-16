const { ensureItsAbsoluteUrl } = require('./ensure_absolute_url');
const { extractPeopleAlsoAsk } = require('./extractor_tools');

exports.extractOrganicResults = ($) => {
    const searchResults = [];

    // just a renamed class name, same layout
    // second selector in 2021-01-15
    $('.g .rc, .g .tF2Cxc').each((index, el) => {
        // HOTFIX: Google is A/B testing a new dropdown, which causes invalid results.
        // For now, just remove it.
        $(el).find('div.action-menu').remove();

        const siteLinks = [];

        const $oldSiteLinksSel = $(el).find('ul li');
        // just a renamed class name, same layout, changed in 2021-01-15
        const $newSiteLinksSel = $(el).find('.St3GK a, .yuRUbf a');
        if ($oldSiteLinksSel.length > 0) {
            $oldSiteLinksSel.each((i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).find('h3').text(),
                    url: $(siteLinkEl).find('h3 a').attr('href'),
                    description: $(siteLinkEl).find('div').text(),
                });
            });
        } else {
            $newSiteLinksSel.each((i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href'),
                    // Seems Google removed decription in the new layout, let's keep it for now though
                    description: $(siteLinkEl).parent('div').parent('h3').parent('div')
                        .find('> div')
                        .toArray()
                        .map(d => $(d).text())
                        .join(' ') || null,
                });
            });
        }


        const productInfo = {};
        const productInfoText = $(el).find('.dhIWPd').text();
        if (productInfoText) {
            const ratingMatch = productInfoText.match(/Rating: ([0-9.]+)/);
            if (ratingMatch) {
                productInfo.rating = Number(ratingMatch[1]);
            }
            const numberOfReviewsMatch = productInfoText.match(/([0-9,]+) reviews/);
            if (numberOfReviewsMatch) {
                productInfo.numberOfReviews = Number(numberOfReviewsMatch[1].replace(/,/g, ''));
            }

            const priceMatch = productInfoText.match(/\$([0-9.,]+)/);
            if (priceMatch) {
                productInfo.price = Number(priceMatch[1].replace(/,/g, ''));
            }
        }

        const searchResult = {
            title: $(el).find('h3').eq(0).text(),
            url: $(el).find('a').attr('href'),
            displayedUrl: $(el).find('cite').eq(0).text(),
            description: $(el).find('.IsZvec').text(),
            siteLinks,
            productInfo,
        };
        searchResults.push(searchResult);
    });

    return searchResults;
};

exports.extractPaidResults = ($) => {
    const ads = [];
    // Keeping the old selector just in case.
    const oldAds = $('.ads-fr');
    const newAds = $('#tads > div');

    // Use whatever selector has more results.
    const $ads = newAds.length >= oldAds.length
        ? newAds
        : oldAds;

    $ads.each((index, el) => {
        const siteLinks = [];
        $(el).find('w-ad-seller-rating').remove();
        $(el).find('a').not('[data-pcu]').not('[ping]')
            .each((i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href'),
                    // Seems Google removed decription in the new layout, let's keep it for now though
                    description: $(siteLinkEl).parent('div').parent('h3').parent('div')
                        .find('> div')
                        .toArray()
                        .map(d => $(d).text())
                        .join(' ') || null,
                });
            });

        const $heading = $(el).find('div[role=heading]');
        const $url = $heading.parent('a');

        // Keeping old description selector for now as it might work on different layouts, remove later
        const $newDescription = $(el).find('.MUxGbd.yDYNvb.lyLwlc > span');
        const $oldDescription = $(el).find('> div > div > div > div > div').eq(1);

        const $description = $newDescription.length > 0 ? $newDescription : $oldDescription;

        ads.push({
            title: $heading.text(),
            url: $url.attr('href'),
            // The .eq(2) fixes getting "Ad." instead of the displayed URL.
            displayedUrl: $url.find('> div > span').eq(2).text(),
            description: $description.text(),
            siteLinks,
        });
    });

    return ads;
};

exports.extractPaidProducts = ($) => {
    const products = [];

    $('.commercial-unit-desktop-rhs .pla-unit').each((i, el) => {
        const headingEl = $(el).find('[role="heading"]');
        const siblingEls = headingEl.nextAll();
        const displayedUrlEl = siblingEls.last();
        const prices = [];

        siblingEls.each((index, siblingEl) => {
            if (siblingEl !== displayedUrlEl[0]) prices.push($(siblingEl).text());
        });

        products.push({
            title: headingEl.text(),
            url: headingEl.find('a').attr('href'),
            displayedUrl: displayedUrlEl.find('span').first().text(),
            prices,
        });
    });

    return products;
};

exports.extractTotalResults = ($) => {
    const wholeString = $('#resultStats').text() || $('#result-stats').text();
    // Remove text in brackets, get numbers as an array of strings from text "Přibližný počet výsledků: 6 730 000 000 (0,30 s)"
    const numberStrings = wholeString.split('(').shift().match(/(\d+(\.|,|\s))+/g);
    // Find the number with highest length (to filter page number values)
    const numberString = numberStrings ? numberStrings.sort((a, b) => b.length - a.length).shift().replace(/[^\d]/g, '') : 0;
    return Number(numberString);
};

exports.extractRelatedQueries = ($, hostname) => {
    const related = [];

    $('#brs a').each((index, el) => {
        related.push({
            title: $(el).text(),
            url: ensureItsAbsoluteUrl($(el).attr('href'), hostname),
        });
    });

    return related;
};

exports.extractPeopleAlsoAsk = ($) => {
    return extractPeopleAlsoAsk($);
};
