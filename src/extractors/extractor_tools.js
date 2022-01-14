const cheerio = require('cheerio');

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

        htmls.forEach((html) => {
            const $Internal = cheerio.load(html);

            // There are might be one extra post that is not really a question
            if ($Internal('[data-md]').length === 0) {
                return;
            }

            // String separation of date from text seems more plausible than all the selector variants
            const date = $Internal('.Od5Jsd, .kX21rb, .xzrguc').text().trim();
            const fullAnswer = $Internal('[data-md]').text().trim();
            const dateMatch = fullAnswer.match(new RegExp(`(.+)${date}$`));
            const answer = dateMatch
                ? dateMatch[1]
                : fullAnswer;
            // Sometimes the question is not in the text but only in the href
            let questionParsedFromHref;
            const questionHref = $Internal('a').last().attr('href');
            if (questionHref) {
                const hrefMatch = questionHref.match(/q=(.+?)&|$/);
                if (hrefMatch && hrefMatch[1]) {
                    questionParsedFromHref = decodeURIComponent(hrefMatch[1]).replace(/\+/g, ' ');
                }
            }
            // Can be 'More results'
            const questionText = $Internal('a').last().text().trim();

            const result = {
                question: questionParsedFromHref || questionText,
                answer,
                url: $Internal('a').attr('href'),
                title: $Internal('a.sXtWJb, a h3').text().trim(),
                date,
            };
            peopleAlsoAsk.push(result);
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
