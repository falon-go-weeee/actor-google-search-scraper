import { Cheerio, Element, load } from 'cheerio';
import { ensureItsAbsoluteUrl } from './ensure_absolute_url';
import { extractPeopleAlsoAsk as _extractPeopleAlsoAsk } from './extractor_tools';

export type CheerioRoot = ReturnType<typeof load>;

export interface SiteLink {
    title: string;
    url: string;
    description: string | null;
}

export interface ProductInfo {
    title?: string;
    url?: string;
    displayedUrl?: string;
    rating?: number;
    numberOfReviews?: number;
    price?: number;
    prices?: string[];
}

export function extractOrganicResults($: CheerioRoot) {
    // Executed on a single organic result (row)
    const parseResult = (el: Element | Cheerio<Element>) => {
        // HOTFIX: Google is A/B testing a new dropdown, which causes invalid results.
        // For now, just remove it.
        $(el).find('div.action-menu').remove();

        const siteLinks: SiteLink[] = [];

        const siteLinksSelOld = 'ul li';
        const siteLinksSel2020 = '.St3GK a';
        const siteLinksSel2021January = 'table';

        if ($(el).find(siteLinksSelOld).length > 0) {
            $(el).find(siteLinksSelOld).each((_i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).find('h3').text(),
                    url: $(siteLinkEl).find('h3 a').attr('href')!,
                    description: $(siteLinkEl).find('div').text(),
                });
            });
        } else if ($(el).find(siteLinksSel2020).length > 0) {
            $(el).find(siteLinksSel2020).each((_i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href')!,
                    // Seems Google removed decription in the new layout, let's keep it for now though
                    description: $(siteLinkEl).parent('div').parent('h3').parent('div')
                        .find('> div')
                        .toArray()
                        .map(d => $(d).text())
                        .join(' ') || null,
                });
            });
        } else if ($(el).parent().parent().siblings(siteLinksSel2021January).length > 0) {
            $(el).parent().parent().siblings(siteLinksSel2021January).find('td .sld').each((_i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).find('a').text(),
                    url: $(siteLinkEl).find('a').attr('href')!,
                    description: $(siteLinkEl).find('.s').text()
                });
            });
        }

        const productInfo: ProductInfo = {};
        const productInfoSelOld = '.dhIWPd';
        const productInfoSel2021January = '.fG8Fp';
        const productInfoText = $(el).find(`${productInfoSelOld}, ${productInfoSel2021January}`).text();
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
            emphasizedKeywords: $(el).find('.IsZvec em, .IsZvec b').map((_i, el) => $(el).text().trim()).toArray(),
            siteLinks,
            productInfo,
        };
        return searchResult;
    }

    // TODO: If you figure out how to reasonably generalize this, you get a medal
    const resultSelectorOld = '.g .rc';
    // We go one deeper to gain accuracy but then we have to go one up for the parsing
    const resultSelector2021January = '.g .tF2Cxc>.yuRUbf';

    let searchResults = $(`${resultSelectorOld}`).map((_index, el) => parseResult(el)).toArray();
    if (searchResults.length === 0) {
        searchResults = $(`${resultSelector2021January}`).map((_index, el) => parseResult($(el).parent())).toArray();
    }

    return searchResults;
}

export interface SiteAd {
    title: string;
    url: string;
    displayedUrl: string;
    description: string;
    emphasizedKeywords: string[];
    siteLinks: SiteLink[];
}

export function extractPaidResults($: CheerioRoot) {
    const ads: SiteAd[] = [];
    // Keeping the old selector just in case.
    const oldAds = $('.ads-fr');
    const newAds = $('#tads > div');

    // Use whatever selector has more results.
    const $ads = newAds.length >= oldAds.length
        ? newAds
        : oldAds;

    $ads.each((_index, el) => {
        const siteLinks: SiteLink[] = [];
        $(el).find('w-ad-seller-rating').remove();
        $(el).find('a').not('[data-pcu]').not('[ping]')
            .each((_i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href')!,
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
            url: $url.attr('href')!,
            // The .eq(2) fixes getting "Ad." instead of the displayed URL.
            displayedUrl: $url.find('> div > span').eq(2).text(),
            description: $description.text(),
            emphasizedKeywords: $description.find('em, b').map((_i, el) => $(el).text().trim()).toArray(),
            siteLinks,
        });
    });

    return ads;
}

export function extractPaidProducts($: CheerioRoot) {
    const products: ProductInfo[] = [];

    $('.commercial-unit-desktop-rhs .pla-unit').each((_i, el) => {
        const headingEl = $(el).find('[role="heading"]');
        const siblingEls = headingEl.nextAll();
        const displayedUrlEl = siblingEls.last();
        const prices: string[] = [];

        siblingEls.each((_index, siblingEl) => {
            if (siblingEl !== displayedUrlEl[0]) prices.push($(siblingEl).text());
        });

        products.push({
            title: headingEl.text(),
            url: headingEl.find('a').attr('href')!,
            displayedUrl: displayedUrlEl.find('span').first().text(),
            prices,
        });
    });

    return products;
}

export function extractTotalResults($: CheerioRoot): number {
    const wholeString = $('#resultStats').text() || $('#result-stats').text();
    // Remove text in brackets, get numbers as an array of strings from text "Přibližný počet výsledků: 6 730 000 000 (0,30 s)"
    const numberStrings = wholeString.split('(').shift()!.match(/(\d+(\.|,|\s))+/g);
    // Find the number with highest length (to filter page number values)
    const numberString = numberStrings ? numberStrings.sort((a, b) => b.length - a.length).shift()!.replace(/[^\d]/g, '') : 0;
    return Number(numberString);
}

export interface RelatedItem {
    title: string;
    url: string;
}

export function extractRelatedQueries($: CheerioRoot, hostname?: string | null) {
    const related: RelatedItem[] = [];

    // 2021-02-25 - Tiny change #brs -> #bres
    $('#brs a, #bres a').each((_index, el) => {
        related.push({
            title: $(el).text(),
            url: ensureItsAbsoluteUrl($(el).attr('href'), hostname)!,
        });
    });

    return related;
}

// TODO type this properly once extractor_tools.js is converted to ts
export function extractPeopleAlsoAsk($: CheerioRoot): unknown {
    return _extractPeopleAlsoAsk($);
}
