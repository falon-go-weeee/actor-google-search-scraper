TS Rewrite notes
================

- `npm i -D typescript @apify/tsconfig`
- create `tsconfig.json` in root, based on the template, extending `@apify/tsconfig`
- try to run `tsc`, see the errors
    - many errors due to sdk and other connected libraries - use `skipLibCheck` to ignore those
    - `dist` folder gets created, even when reporting errors, TS will compile our files
    - ignore the `dist` folder in git
- try to enable JS checks (allowJs and checkJs)
    - lots of errors in our code if we try to compile, mainly due to strict settings in TS (e.g. noImplicitAny, unused vars)
    - disable JS checks for now (checkJs), we will be gradually converting to TS and dealing with that on the way
- starting with basics - consts.js -> .ts
    - convert require to import, we see the underscore typings are missing (the library is JS only and do not provide them in the package)
    - with require we would end up with `any`
    - `npm i -D typescript @types/underscore`
    - default import vs named import
    - convert other exports to ESM
    - we can use import for the JSON file too - reexporting existing variable via `export { ... }`
- now main.js -> .ts
    - convert to ESM first to have typechecks
    - `Apify.getInput()` - no generic parameter we could use, and returns union
        - we need to narrow the type, via type assertion
        - model the inputs interface first - for now just a simple interface with string/number/boolean
        - show how it would work with generics too
        - show different syntax of type casting
    - `prepareRequestFunction` should return void, let's drop the return statement
    - `matches` var - regexp can return null if nothing found
        - we can either check in the code (type guards)
        - or if we are sure the input is actually from a select/enum, we can just add `!` (non null assertion)
    - `data` var uses inference, so not possible to add more properties to the object later
        - we could model the interface just like with the input and specify type explicitly
        - or we can just use `Record` to have a generic dictionary
    - `resultsPerPage` is union again, we need to narrow to number
        - we can see the problem is actually valid, it is taken from query, and should be therefore a string, not a number
        - use a ternary and cast to number if available
    - `datasetId` not defined on `Dataset` type
        - lets assume it is badly typed, we either assert or override/redeclare the type
- now tools.js -> .ts
    - convert to ESM first
    - `getInitialRequests` will need an interface to type the parameter
    - need to cast the key for accessing `COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN` (using keyof typeof)
    - `qs` has same issue with object type inference, we can use `Record` again
    - `executeCustomDataFunction` needs to cast the error parameter, or we can disable this validation (TS 4.4+)
    - with `getInfoStringFromResults` we could again use `Record`, for now lets just type the items to `any`
        - we could create interface for `data` and reuse it here
    - `createDebugInfo` needs typing of request and response - no response type available, lets create one
        - `status?: Function` or better `status?: () => number`
        - type the `statusCode` var - needs to have both undefined and null (`let statusCode: number | null | undefined = null;`)
    - `ensureAccessToSerpProxy` - parameter has implicit any
        - `(group: { name: string })`
- now desktop.js -> .ts
    - typing cheerio's `$` is a bit tricky, we need:
      import { Element, load } from 'cheerio';
      type CheerioRoot = ReturnType<typeof load>;
    - we need `SiteLink` interface
    - `i` var in iterator not use, prefix it to get rid of warning (or disable `noUnusedLocals`)
    - `.attr('href')` may be undefined if attribute is not there, we can just add `!` if we know its safe
        - or make the property in interface optional
    - we need union here `const parseResult = (el: Element | Cheerio<Element>) => {`
    - `shift()!`
    - conflict in names of `extractPeopleAlsoAsk`, aliased import
    - after conversion there are build issues
        - `extractorsDesktop` - use start import
        - `extractRelatedQueries` need to allow null for hostname too
        - `extractOrganicResults` do not have two parameters
- now ensure_absolute_url.js, this one is trivial, we just need to support `null` explicitly again
- now extractor_tools.js -> .ts
    - we need `CheerioRoot` again, so lets export it and reuse the type alias
    - nothing new really, should be trivial now, add an interface for the resulting array, add few `!` or handle possible failures
- index.js -> ts is again very similar to what we just did
- mobile.js -> .ts
    - we see `ensureItsAbsoluteUrl` has a flaw, it can return undefined, which is not a valid parameter for `new URL()`
    - otherwise nothing new, when we finish we again need to change to star import of this file in main.ts and index.ts
- finally we can get back to our TODO and fix the return type of `extractPeopleAlsoAsk`
- to finalize the project conversion, we should add some scripts
    - add b`uild` (tsc)
    - add `start:dev` with ts-node (might be irrelevant here)
    - start needs to use dist instead of src
- and adjust the dockerfile - `RUN npm run build`
- for testing, we can use following input schema:

```json
{
    "queries": "Hotels in NYC\nRestaurants in NYC\nhttps://www.google.com/search?q=restaurants+in+NYC",
    "customDataFunction": "async ({ input, $, request, response, html }) => {\n  return {\n    pageTitle: $('title').text(),\n  };\n};",
    "saveHtml": false,
    "saveHtmlToKeyValueStore": false,
    "mobileResults": false,
    "includeUnfilteredResults": false
}
```
