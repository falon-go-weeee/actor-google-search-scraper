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
 * @param {cheerio.CheerioAPI} $
 */
exports.extractPeopleAlsoAsk = ($) => {
    const peopleAlsoAsk = [];

    // HTML that we need is hidden in escaped script texts
    const scriptMatches = $('html').html().match(/,'\\x3cdiv class\\x3d[\s\S]+?'\);\}\)/gi);

    if (Array.isArray(scriptMatches)) {
        const htmls = scriptMatches.map((match) => {
            const escapedHtml = match.replace(',\'', '').replace('\');})', '');
            const unescaped = escapedHtml.replace(/\\x(\w\w)/g, (_match, group) => {
                const charCode = parseInt(group, 16);
                return String.fromCharCode(charCode);
            });
            return unescaped;
        });

        const questions = $('[data-q]').map((index, el) => {
            const $el = $(el);
            return {
                index,
                question: $el.attr('data-q').trim(),
                link: $el.find('a[href^="/search"]').attr('href'),
            };
        }).get();

        let answerIndex = 0;

        htmls.forEach((html, i) => {
            const $Internal = cheerio.load(html);

            // There are might be one extra post that is not really a question
            if ($Internal('[data-md]').length === 0) {
                return;
            }

            // some answers are split into two contiguous divs
            const $nextDiv = (htmls[i + 1] && cheerio.load(htmls[i + 1])?.('.g')) ?? null;

            // String separation of date from text seems more plausible than all the selector variants
            const date = $Internal('.Od5Jsd, .kX21rb, .xzrguc').text().trim();
            const fullAnswer = $Internal('[data-md]').text().trim();
            const dateMatch = fullAnswer.match(new RegExp(`(.+)${date}$`));
            const answer = dateMatch
                ? dateMatch[1]
                : fullAnswer;

            // Can be 'More results'
            const questionText = $Internal('a').last().text().trim();

            const result = {
                question: questions[answerIndex].question || questionText,
                answer,
                // N.B.: hardcoding it here, but should come from the hostname parameter, but it's
                // a breaking change
                url: ensureItsAbsoluteUrl(questions[answerIndex].link, 'www.google.com')
                    || $nextDiv?.find('a').first().attr('href')
                    || $Internal('a[href]:not([href^="https://www.google"])').first().attr('href')
                    || null,
                title: $nextDiv?.find('h3').first().text().trim() ?? $Internal('a.sXtWJb, h3').text().trim(),
                date,
            };

            peopleAlsoAsk.push(result);
            answerIndex += 1;
        });
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
