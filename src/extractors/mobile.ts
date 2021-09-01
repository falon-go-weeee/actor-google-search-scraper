import { ensureItsAbsoluteUrl } from './ensure_absolute_url';
import { extractPeopleAlsoAsk as _extractPeopleAlsoAsk } from './extractor_tools';
import { CheerioRoot, ProductInfo, RelatedItem, SiteAd, SiteLink } from './desktop';
import { URL } from 'url';

/**
 * there are 3 possible mobile layouts, we need to find out
 * which one is the current by looking at some unique elements
 * on the page
 *
 * @returns {'weblight' | 'mobile' | 'desktop-like'}
 */
export const determineLayout = ($: CheerioRoot) => {
    if ($('meta[content*="xml"]').length > 0) {
        // this version is the lowest-end possible
        // all links are appended with googleweblight.com
        return 'weblight';
    }

    if ($('meta[name="viewport"]').length > 0 && $('html[itemscope]').length === 0) {
        // this version is intermediate and has a layout
        // made only for mobile.
        return 'mobile';
    }

    // assume a desktop-like layout, with Javascript enabled
    return 'desktop-like';
};

/**
 * Extracts URL from /url?q=[site here]
 * Sometimes it's nested
 */
const getUrlFromParameter = (url?: string, hostname?: string | null) => {
    if (!url) {
        return '';
    }

    try {
        let parsedUrl = new URL(ensureItsAbsoluteUrl(url, hostname)!);
        let query = (parsedUrl.searchParams.get('q') || url);

        if (query.includes('googleweblight')) {
            // nested url, must get the url from `lite_url` query param
            // usually from the https:// version of the search
            parsedUrl = new URL(query);
            query = parsedUrl.searchParams.get('lite_url') || query;
        }

        return query;
    } catch (e) {
        return '';
    }
}

export interface SearchResult {

}

export function extractOrganicResults($: CheerioRoot, hostname?: string | null) {
    const searchResults: SearchResult[] = [];

    const layout = determineLayout($);

    if (layout === 'desktop-like') {
        // Not sure if #ires, .srg > div still works in some cases, left it there for now after I added the third selector (Lukas)
        $('#ires, .srg > div, .mnr-c.xpd.O9g5cc.uUPGi').each((_index, el) => {
            const siteLinks: SiteLink[] = [];
            const $el = $(el);

            $el
                .find('[jsname].m8vZ3d a')
                .each((_i, siteLinkEl) => {
                    siteLinks.push({
                        title: $(siteLinkEl).text(),
                        url: $(siteLinkEl).attr('href')!,
                        description: null,
                    });
                });

            const productInfo: ProductInfo = {};
            const productInfoRatingText = $(el).find('.tP9Zud').text().trim();

            // Using regexes here because I think it might be more stable than complicated selectors
            if (productInfoRatingText) {
                const ratingMatch = productInfoRatingText.match(/([0-9.]+)\s+\(([0-9,]+)\)/);
                if (ratingMatch) {
                    productInfo.rating = Number(ratingMatch[1]);
                    productInfo.numberOfReviews = Number(ratingMatch[2]);
                }
            }

            const productInfoPriceText = $(el).find('.xGipK').text().trim();
            if (productInfoPriceText) {
                productInfo.price = Number(productInfoPriceText.replace(/[^0-9.]/g, ''));
            }


            searchResults.push({
                title: $el.find('a div[role="heading"]').text(),
                url: $el.find('a').first().attr('href'),
                displayedUrl: $el.find('span.qzEoUe').first().text(),
                description: $el.find('div.yDYNvb').text(),
                emphasizedKeywords: $el.find('div.yDYNvb').find('em, b').map((_i, el) => $(el).text().trim()).toArray(),
                siteLinks,
                productInfo,
            });
        });
    }

    if (layout === 'mobile') {
        $('#main > div:not([class])')
            .filter((_index, el) => {
                return $(el).find('a[href^="/url"]').length > 0;
            })
            .each((_index, el) => {
                const $el = $(el);

                const siteLinks: SiteLink[] = [];

                $el
                    .find('.s3v9rd a')
                    .each((_i, siteLinkEl) => {
                        siteLinks.push({
                            title: $(siteLinkEl)
                                .text()
                                .trim(),
                            url: getUrlFromParameter(
                                $(siteLinkEl).attr('href')!,
                                hostname,
                            ),
                            description: null,
                        });
                    });

                // product info not added because I don't know how to mock this (Lukas)
                const $description = $el.find('.s3v9rd').first().find('> div > div > div')
                    .clone()
                    .children()
                    .remove()
                    .end();

                searchResults.push({
                    title: $el.find('a > h3').eq(0).text().trim(),
                    url: getUrlFromParameter($el.find('a').first().attr('href'), hostname),
                    displayedUrl: $el.find('a > div').eq(0).text().trim(),
                    description: $description.text().replace(/ · /g, '').trim(),
                    emphasizedKeywords: $description.find('em, b').map((_i, el) => $(el).text().trim()).toArray(),
                    siteLinks,
                });
            });
    }

    if (layout === 'weblight') {
        $('body > div > div > div')
            .filter((_index, el) => {
                return $(el).find('a[href*="googleweblight"],a[href^="/url"]').length > 0;
            })
            .each((_index, el) => {
                const $el = $(el);
                const siteLinks: SiteLink[] = [];

                $el
                    .find('a.M3vVJe')
                    .each((_i, siteLinkEl) => {
                        siteLinks.push({
                            title: $(siteLinkEl).text(),
                            url: getUrlFromParameter(
                                $(siteLinkEl).attr('href'),
                                hostname,
                            ),
                            description: null,
                        });
                    });

                // product info not added because I don't know how to mock this (Lukas)

                searchResults.push({
                    title: $el
                        .find('a > span')
                        .eq(0)
                        .text()
                        .trim(),
                    url: getUrlFromParameter(
                        $el
                            .find('a')
                            .first()
                            .attr('href'),
                        hostname,
                    ),
                    displayedUrl: $el
                        .find('a > span')
                        .eq(1)
                        .text()
                        .trim(),
                    description: $el.find('table span').first().text().trim(),
                    emphasizedKeywords: $el.find('table span').first().find('em, b').map((_i, el) => $(el).text().trim()).toArray(),
                    siteLinks,
                });
            });
    }

    return searchResults;
}

export function extractPaidResults($: CheerioRoot) {
    const ads: SiteAd[] = [];

    const layout = determineLayout($);

    if (layout === 'desktop-like') {
        $('.ads-fr').each((_index, el) => {
            const siteLinks: SiteLink[] = [];
            $(el).find('a')
                .not('[data-rw]')
                .not('[ping]')
                .not('[data-is-ad]')
                .not('.aob-link')
                .each((_i, link) => {
                    if ($(link).attr('href')) {
                        siteLinks.push({
                            title: $(link).text(),
                            url: $(link).attr('href')!,
                            description: null,
                        });
                    }
                });

            const $heading = $(el).find('div[role=heading]');
            const $url = $heading.parent('a');

            ads.push({
                title: $heading.find('span').length ? $heading.find('span').toArray().map(s => $(s).text()).join(' ') : $heading.text(),
                url: $url.attr('href')!,
                displayedUrl: $url.next('div').find('> span').eq(1).text()
                    || $url.find('> div').eq(0).find('> div > span').eq(1).text(),
                description: $url.parent().next('div').find('span').eq(0).text(),
                emphasizedKeywords: $url.parent().next('div').find('span').eq(0).find('em, b')
                    .map((_i, el) => $(el).text().trim()).toArray(),
                siteLinks,
            });
        });

        // Different desktop-like layout
        if (ads.length === 0) {
            $('#tads .uEierd').each((_i, el) => {
                const siteLinks: SiteLink[] = [];
                // This is for vertical sie links
                $(el).find('.BmP5tf .MUxGbd a[data-hveid]').each((_i, el) => {
                    siteLinks.push({
                        title: $(el).text().trim(),
                        url: $(el).attr('href')!,
                        description: null,
                    })
                })

                // This is for horizontal site links
                $(el).find('g-scrolling-carousel a').each((_i, el) => {
                    siteLinks.push({
                        title: $(el).text().trim(),
                        url: $(el).attr('href')!,
                        description: null,
                    })
                })

                ads.push({
                    title: $(el).find('[role="heading"]').text().trim(),
                    url: $(el).find('a').attr('href')!,
                    displayedUrl: $(el).find('a .Zu0yb.UGIkD.qzEoUe').text().trim(),
                    description: $(el).find('.BmP5tf .MUxGbd.yDYNvb.lEBKkf').text().trim(),
                    emphasizedKeywords: $(el).find('.BmP5tf .MUxGbd.yDYNvb.lEBKkf').find('em, b')
                        .map((_i, el) => $(el).text().trim()).toArray(),
                    siteLinks,
                });
            })
        }
    }

    if (layout === 'mobile') {
        $('#main > div').filter((_i, el) => $(el).find('div[role=heading]').length > 0)
            .each((_i, el) => {
                const $el = $(el);

                const siteLinks: SiteLink[] = [];
                $(el).find('> div > div > div > a').each((_j, link) => {
                    siteLinks.push({
                        title: $(link).text(),
                        url: $(link).attr('href')!,
                        description: null,
                    });
                });

                const $heading = $el.find('[role="heading"]');

                ads.push({
                    title: $heading.text(),
                    url: $el.find('a[href*="aclk"]').attr('href')!,
                    displayedUrl: $heading.next('div').find('> span > span').text(),
                    description: $el.find('> div > div > div > span').text(),
                    emphasizedKeywords:  $el.find('> div > div > div > span').find('em, b')
                        .map((_i, el) => $(el).text().trim()).toArray(),
                    siteLinks,
                });
            });
    }

    return ads;
}

export function extractPaidProducts($: CheerioRoot) {
    const products: ProductInfo[] = [];

    $('.shopping-carousel-container .pla-unit-container').each((_i, el) => {
        const headingEl = $(el).find('[role="heading"]');
        const siblingEls = headingEl.nextAll();
        const displayedUrlEl = siblingEls.last();
        const prices: string[] = [];

        siblingEls.each((_index, siblingEl) => {
            if (siblingEl !== displayedUrlEl[0]) prices.push($(siblingEl).text());
        });

        products.push({
            title: headingEl.text(),
            url: $(el).find('a').attr('href'),
            displayedUrl: $(el).find('.a').text(),
            prices,
        });
    });

    return products;
}

export function extractTotalResults() {
    return 'N/A';
}

export function extractRelatedQueries($: CheerioRoot, hostname?: string | null) {
    const related: RelatedItem[] = [];

    const layout = determineLayout($);

    if (layout === 'desktop-like') {
        $('#extrares').find('h2').nextAll('a').each((_index, el) => {
            related.push({
                title: $(el).text().trim(),
                url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
            });
        });
        // another type of related searches
        $('#bres span a').each((_index, el) => {
            related.push({
                title: $(el).text().trim(),
                url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
            });
        });
        // another type of related searches
        $('#brs p a').each((_index, el) => {
            related.push({
                title: $(el).text().trim(),
                url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
            });
        });
    }

    if (layout === 'mobile') {
        $('a[href^="/search"].tHmfQe').each((_index, el) => {
            related.push({
                title: $(el).text().trim(),
                url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
            });
        });
    }

    if (layout === 'weblight') {
        $('a[href^="/search"].ZWRArf').each((_index, el) => {
            related.push({
                title: $(el).text().trim(),
                url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
            });
        });
    }

    return related;
}

export function extractPeopleAlsoAsk($: CheerioRoot) {
    return _extractPeopleAlsoAsk($);
}
