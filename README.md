## Features
Our free SERP API crawls Google Search Results Pages (SERP or SERPs) and extracts data from the HTML in a structured format such as JSON, XML, CSV, or Excel. 

The following data can be extracted from each SERP:

- Organic results
- Ads
- Product ads
- Related queries
- People Also Ask
- Prices
- Review rating and review count
- Additional custom attributes

Note that this SERP scraper doesn't support special types of Google searches, such as [Google Shopping](https://www.google.com/shopping),
[Google Images](https://www.google.com/imghp), or [Google News](https://news.google.com).

## SERP API
Our Google Search Results Pages Scraper gives you a RESTful SERP API that provides real-time results optimized for structured JSON output that you can download and use any way you want.

## Why use a SERP API?
Google Search processes over [3.5 billion searches](https://www.internetlivestats.com/google-search-statistics/) per day and accounts for an incredible [92.6 percent](https://www.oberlo.com/statistics/search-engine-market-share) of all search queries across all search engine providers. 

Those numbers mean that it's really important for businesses to know how they and their competitors rank on Google. Unfortunately, Google Search does not provide an official SERP API, so the only way to efficiently monitor search results and ranking is to use web scraping.

Our free googlescraper tool gives you your own, customizable SERP scraper. You can do whatever you want with the SERP data once you extract and download it.

Typical use cases include:

- Use it for search engine optimization (SEO) and monitor how your website performs on Google for certain queries over time.
- Analyze display ads for a given set of keywords.
- Monitor your competition in both organic and paid results.
- Build a URL list for certain keywords. This is useful if, for example, you need good relevant starting points when scraping web pages containing specific phrases.

For more inspiration, check out our [industries pages](https://apify.com/industries), where you can find suggestions on how to use web scraping in a range of different sectors.

## Tutorial
If you would like a step-by-step tutorial on how to use the Google Results Search Scraper, read our blog post on [how to scrape Google Search](https://blog.apify.com/unofficial-google-search-api-from-apify-22a20537a951). It's also packed with ideas on what you can do with data you scrape from Google Search and gives you clear instructions on how to run the scraper, with screenshots and examples.

## Cost of usage
Our SERP Scraper is free to use, but to scrape SERPs effectively, you should use [Apify Proxy](https://apify.com/proxy) and you need to set a sufficient limit for Google SERP queries (you can see the limit on your [Account](https://my.apify.com/account) page).

New Apify users have a free trial of Apify Proxy and Google SERPs, so you can use the actor for free at the beginning.

Once the Apify Proxy trial expires, you'll need to subscribe to a [paid plan](https://apify.com/pricing) in order to keep using the actor. If you need to increase your Google SERPs limit on Apify Proxy or have any questions, please email [support@apify.com](mailto:support@apify.com)

## Number of results
You can change the number of results per page by using the `resultsPerPage` parameter. The default is 10, but the allowed values are 10-100. You can also set `maxPagesPerQuery` to get more results for each query.

Please note that, although Google always shows that it internally found millions of results, **Google will never display more than a few hundred results for a single search query**. If you need to get as many results as possible, try to create many similar queries and combine different parameters and locations.

## Input settings
The actor gives you fine-grained control over what kind of Google Search results you'll get.

You can specify the following settings:

- Query phrases or raw URLs
- Country
- Language
- Exact geolocation
- Number of results per page
- Mobile or desktop version

For a complete description of all settings, see  [input specification](https://www.apify.com/apify/google-search-scraper?section=input-schema).

## Results
The actor stores its result in the default [dataset](https://apify.com/docs/storage#dataset) associated with the actor run, from which you can export it
to various formats, such as JSON, XML, CSV, or Excel.

The results can be downloaded from the [Get dataset items](https://www.apify.com/docs/api/v2#/reference/datasets/item-collection/get-items) API endpoint:

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=[FORMAT]
```

where `[DATASET_ID]` is the ID of the dataset and `[FORMAT]`
can be `csv`, `html`, `xlsx`, `xml`, `rss` or `json`.

For each Google Search results page, the dataset will contain a single record, which in JSON format looks as follows. Bear in mind that some fields have example values:

```json
{
  "searchQuery": {
    "term": "Hotels in Prague",
    "page": 1,
    "type": "SEARCH",
    "domain": "google.cz",
    "countryCode": "cz",
    "languageCode": "en",
    "locationUule": null,
    "resultsPerPage": "10"
  },
  "url": "http://www.google.com/search?gl=cz&hl=en&num=10&q=Hotels%20in%20Prague",
  "hasNextPage": false,
  "resultsTotal": 138000000078,
  "relatedQueries": [
    {
      "title": "cheap hotels in prague",
      "url": "https://www.google.com/search?hl=en&gl=CZ&q=cheap+hotels+in+prague&sa=X&sqi=2&ved=2ahUKEwjem6jG9cTgAhVoxlQKHeE4BuwQ1QIoAHoECAoQAQ"
    },
    {
      "title": "best hotels in prague old town",
      "url": "https://www.google.com/search?hl=en&gl=CZ&q=best+hotels+in+prague+old+town&sa=X&sqi=2&ved=2ahUKEwjem6jG9cTgAhVoxlQKHeE4BuwQ1QIoAXoECAoQAg"
    },
    // ...
  ],
  "paidResults": [
    {
      "title": "2280 Hotels in Prague | Best Price Guarantee | booking.com",
      "url": "https://www.booking.com/go.html?slc=h3;aid=303948;label=",
      "displayedUrl": "www.booking.com/",
      "description": "Book your Hotel in Prague online. No reservation costs. Great rates. Bed and Breakfasts. Support in 42 Languages. Hotels. Motels. Read Real Guest Reviews. 24/7 Customer Service. 34+ Million Real Reviews. Secure Booking. Apartments. Save 10% with Genius. Types: Hotels, Apartments, Villas.£0 - £45 Hotels - up to £45.00/day - Book Now · More£45 - £90 Hotels - up to £90.00/dayBook Now£130 - £180 Hotels - up to £180.00/dayBook Now£90 - £130 Hotels - up to £130.00/dayBook Nowup to £45.00/dayup to £90.00/dayup to £180.00/dayup to £130.00/day",
      "siteLinks": [
        {
          "title": "Book apartments and more",
          "url": "https://www.booking.com/go.html?slc=h3;aid=303948;label=",
          "description": "Bookings instantly confirmed!Instant confirmation, 24/7 support"
        },
        {
          "title": "More than just hotels",
          "url": "https://www.booking.com/go.html?slc=h2;aid=303948;label=",
          "description": "Search, book, stay – get started!Hotels when and where you need them"
        }
      ]
    },
    {
      "title": "Hotels In Prague | Hotels.com™ Official Site‎",
      "displayedUrl": "www.hotels.com/Prague/Hotel",
      "description": "Hotels In Prague Book Now! Collect 10 Nights and Get 1 Free. Budget Hotels. Guest Reviews. Last Minute Hotel Deals. Luxury Hotels. Exclusive Deals. Price Guarantee. Photos & Reviews. Travel Guides. Earn Free Hotel Nights. No Cancellation Fees. Types: Hotel, Apartment, Hostel.",
      "siteLinks": []
    },
    // ...
  ],
  "paidProducts": [],
  "organicResults": [
    {
      "title": "30 Best Prague Hotels, Czech Republic (From $11) - Booking.com",
      "url": "https://www.booking.com/city/cz/prague.html",
      "displayedUrl": "https://www.booking.com › Czech Republic",
      "description": "Great savings on hotels in Prague, Czech Republic online. Good availability and great rates. Read hotel reviews and choose the best hotel deal for your stay.",
      "siteLinks": [],
      "productInfo": {
          "price": "$123",
          "rating": 4.7,
          "numberOfReviews": 4510
      },
    },
    {
      "title": "The 30 best hotels & places to stay in Prague, Czech Republic ...",
      "url": "https://www.booking.com/city/cz/prague.en-gb.html",
      "displayedUrl": "https://www.booking.com › Czech Republic",
      "description": "Great savings on hotels in Prague, Czech Republic online. Good availability and great rates. Read hotel reviews and choose the best hotel deal for your stay.",
      "siteLinks": [],
      "productInfo": {},
    },
    // ...
  ],
  "peopleAlsoAsk": [
    {
      "question": "What is the name of the best hotel in the world?",
      "answer": "Burj Al Arab Jumeirah, Dubai. Arguably Dubai's most iconic hotel, the Burj Al Arab rises above the Persian Gulf on its own man-made island like a giant sail. Everything here is over-the-top, from the gilded furnishings in its guest rooms to the house fleet of Rolls-Royces.",
      "url": "https://www.travelandleisure.com/worlds-best/hotels-top-100-overall",
      "title": "Best 100 Hotels: World's Best Hotels 2020 | Travel + Leisure | Travel ...",
      "date": "Jul 8, 2020"
    }
  ],
  "customData": {
    "pageTitle": "Hotels in Prague - Google Search"
  }
},
```

### How to get one search result per row

If you're only interested in organic Google Search results and want to get just one organic or paid result per row on output, just query the `fields=searchQuery,organicResults` and `unwind=organicResults` query parameters to the API endpoint URL:

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=[FORMAT]&fields=searchQuery,organicResults&unwind=organicResults
```

The API will return a result like this (in JSON format):

```json
[
  {
    "searchQuery": {
      "term": "Restaurants in Prague",
      "page": 1,
      // ...
    },
    "title": "THE 10 BEST Restaurants in Prague 2019 - TripAdvisor",
    "url": "https://www.tripadvisor.com/Restaurants-g274707-Prague_Bohemia.html",
    "displayedUrl": "https://www.tripadvisor.com/Restaurants-g274707-Prague_Bohemia.html",
    "description": "Best Dining in Prague, Bohemia: See 617486 TripAdvisor traveler reviews of 6232 Prague restaurants and search by cuisine, price, location, and more.",
    "siteLinks": []
  },
  {
    "searchQuery": {
      "term": "Restaurants in Prague",
      "page": 1,
      // ...
    },
    "title": "The 11 Best Restaurants in Prague | Elite Traveler",
    "url": "https://www.elitetraveler.com/finest-dining/restaurant-guide/the-11-best-restaurants-in-prague",
    "displayedUrl": "https://www.elitetraveler.com/finest-dining/restaurant.../the-11-best-restaurants-in-prag...",
    "description": "Jan 16, 2018 - With the regional fare certainly a highlight of dining in Prague, a great number of superb international eateries have touched down to become ...",
    "siteLinks": []
  },
  // ...
]
```

When using a tabular format such as `csv` or `xls`, you'll get a table where each row contains just one organic result. For more details about exporting and formatting the dataset records, please see the documentation for the [Get dataset items](https://apify.com/docs/api/v2#/reference/datasets/item-collection/get-items) API endpoint.

## Tips and tricks
* Crawling the second and subsequent results pages might be slower than the first page.
* If you need to scrape a lot of results for a single query, you can greatly improve the speed of the crawl by setting **Results per page** (`resultsPerPage`) to 100, so that you get 100 results per page instead of crawling 10 pages, each with 10 results.

## Personal data
You should be aware that search results can contain personal data. Personal data is protected by GDPR in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers. You can also read our blog post on the [legality of web scraping](https://blog.apify.com/is-web-scraping-legal/).

## Changelog
Google Search Results Scraper is under active development and we regularly introduce new features and fix bugs. We also often have to hotfix the scraper when Google changes its Search Engine Results Page layout. Check the [Changelog](https://github.com/apify/actor-google-search-scraper/blob/master/CHANGELOG.md) for recent updates.
