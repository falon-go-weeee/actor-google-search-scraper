const cheerio = require('cheerio');
const chrono = require('chrono-node');
const { ensureItsAbsoluteUrl } = require('./ensure_absolute_url');

exports.extractDescriptionAndDate = (text) => {
    let date;
    let description = (text || '').trim();
    // Parse all dates in the description
    const parsedDates = chrono.parse(description);
    if (parsedDates.length > 0) {
        // we may use this parsed description date and add it to the output object
        const [descriptionDate] = parsedDates;
        // If first date is at the beginning of the description, we remove it
        if (descriptionDate.index === 0) {
            date = descriptionDate.date().toISOString(); // we use the refDate to avoid the timezone offset
            description = description.slice(descriptionDate.text.length).trim();
            // Removes leading non-word characters
            description = description.replace(/^\W+/g, '');
        }
    }
    return { description, date };
};

/**
 * Extract the encrypted contents from the inline Javascript payloads
 *
 * @param {cheerio.CheerioAPI} $
 */
const decodeScriptsContent = ($) => {
    // HTML that we need is hidden in escaped script texts
    const scriptMatches = $('html').html().match(/,'\\x3cdiv class\\x3d[\s\S]+?'\);\}\)/guim);

    if (Array.isArray(scriptMatches)) {
        return scriptMatches.map((match) => {
            const escapedHtml = match
                .replace(',\'', '')
                .replace('\');})', '');

            const unescaped = escapedHtml.replace(/\\x(\w{2})/g, (_match, group) => {
                // parse ASCII hex characters representations to their plain counterpart
                // \x3c => <
                const charCode = parseInt(group, 16);

                return String.fromCharCode(charCode);
            }).replace(/\\u(\w{4})/g, (_match, group) => {
                // convert unicode to HTML entities
                // \u203a => &#8250;
                return `&#${parseInt(group, 16)};`;
            });

            return cheerio.load(unescaped, { decodeEntities: true, xml: false });
        });
    }

    return [];
};

exports.decodeScriptsContent = decodeScriptsContent;

/**
 * @param {cheerio.CheerioAPI} $
 */
exports.extractPeopleAlsoAsk = ($) => {
    const peopleAlsoAsk = [];

    // HTML that we need is hidden in escaped script texts
    const htmls = decodeScriptsContent($);

    if (!htmls?.length) {
        return peopleAlsoAsk;
    }

    const questions = $('[data-q]').map((index, el) => {
        const $el = $(el);

        return {
            index,
            question: $el.attr('data-q').trim(),
            link: $el.find('a[href^="/search"]').attr('href'),
        };
    }).get();

    let answerIndex = 0;

    for (const [i, $Internal] of htmls.entries()) {
        if ($Internal('[data-md]').length === 0) {
            continue;
        }

        const $nextDiv = htmls?.[i + 1]?.('.g');

        if (!$nextDiv?.length) {
            continue;
        }

        // String separation of date from text seems more plausible than all the selector variants
        const date = $Internal('.Od5Jsd, .kX21rb, .xzrguc').text().trim();
        const fullAnswer = $Internal('[data-md]').text().trim();
        const dateMatch = fullAnswer.match(new RegExp(`(.+)${date}$`));
        const answer = dateMatch
            ? dateMatch[1]
            : fullAnswer;

        // Can be 'More results'
        const questionText = $Internal('a').last().text().trim();

        if (questions[answerIndex]?.question) {
            const result = {
                question: questions[answerIndex].question || questionText,
                answer,
                // N.B.: hardcoding it here, but should come from the hostname parameter, but it's
                // a breaking change
                url: ensureItsAbsoluteUrl(questions[answerIndex].link, 'www.google.com')
                    || $nextDiv?.find('a').first().attr('href')
                    || $Internal('a[href]:not([href^="https://www.google"])').first().attr('href')
                    || null,
                title: $nextDiv?.find('h3').first().text().trim()
                    ?? $Internal('a.sXtWJb, h3').text().trim(),
                date,
            };

            peopleAlsoAsk.push(result);
            answerIndex += 1;
        }
    }

    return peopleAlsoAsk;

    // Old parser - works in browser, keeping for a future reference if needed
    /*
    const date = $('.Od5Jsd, .kX21rb').text().trim();
    const fullAnswer = $('.mod').text().trim();
    const dateMatch = fullAnswer.match(new RegExp(`(.+)${date}$`));
    const answer = dateMatch
        ? dateMatch[1]
        : fullAnswer;
    const result = {
        question: $('div').eq(0).text().trim(),
        answer,
        url: $('a').attr('href'),
        title: isMobile ? $('a.sXtWJb').text().trim() : $('a h3').text().trim(),
        date,
    };
    */
};
