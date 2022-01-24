# Google Extractors

Parses detailed data from Google Search Result Page (SERP) HTML.

## Features
- Provides both desktop and mobile format parsers
- Supports multiple old and new layouts for both desktop and mobile
- Extracts
    - Organic results
    - Paid results
    - Site links
    - Paid products
    - Related queries
    - People also ask

## Usage
```javascript
const httpRequest = require('@apify/http-request');
const { extractResults } = require('@apify/google-extractors');

(async () => {
    // Obtain Google results HTML with desktop or mobile user agent using your favourite HTTP client
    const response = await httpRequest({
        url: 'https://www.google.com/search?q=web+scraping',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
        },
    });
    const html = response.body;

    const data = extractResults(html, { mobile: false });

    // print organic results
    console.dir(data.organicResults, { depth: null, colors: true });
    // print paid results
    console.dir(data.paidResults, { depth: null, colors: true });
})();
```

## Output format
The output format is the same as for [Google Search Results Scraper](https://github.com/apify/actor-google-search-scraper#Results) actor provided by Apify.

## Changelog
2021-01-21 (1.2.2)
- Fixed organic results for desktop (new layout)
- Added `date` field
2021-01-19 (1.2.0)
- Fixed new layout for organic results
- Added `emphasizedKeywords` field for each organic result
2020-11-19
- Fixed new layout for paid mobile results

