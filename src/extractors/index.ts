import cheerio from 'cheerio';
import * as desktopExtractors from './desktop';
import * as mobileExtractors from './mobile';
import { CheerioRoot } from './desktop';

/**
 * Extracts paid and organic Google Search Results from provided
 * HTML string or a pre-loaded cheerio instance.
 *
 * @param {cheerio|string} source
 * @param {{ mobile: boolean }} options
 * @return {{
 *     paidResults: Array,
 *     organicResults: Array,
 * }}
 */
export function extractResults(source: CheerioRoot | string, options: { mobile?: boolean } = {}) {
    const $ = typeof source === 'string' ? cheerio.load(source) : source;
    const extractors = options.mobile ? mobileExtractors : desktopExtractors;
    // Some of the extractors use host parameter which is not available in this function
    // So it won't ensure the full URL is some results
    return {
        resultsTotal: extractors.extractTotalResults($),
        relatedQueries: extractors.extractRelatedQueries($),
        paidResults: extractors.extractPaidResults($),
        paidProducts: extractors.extractPaidProducts($),
        organicResults: extractors.extractOrganicResults($),
        peopleAlsoAsk: extractors.extractPeopleAlsoAsk($),
    };
}
