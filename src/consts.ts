import { invert } from 'underscore';
import COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN from './google_domains.json';

export { COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN };

export const GOOGLE_SEARCH_DOMAINS = Object.values(COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN);

export const GOOGLE_SEARCH_DOMAIN_TO_COUNTRY_CODE = invert(COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN);

export const GOOGLE_SEARCH_URL_REGEX = new RegExp(`^(http|https)://(www.){0,1}((${GOOGLE_SEARCH_DOMAINS.join(')|(')}))/search?.*$`, 'i');

export const DEFAULT_GOOGLE_SEARCH_DOMAIN_COUNTRY_CODE = 'US';

export const REQUIRED_PROXY_GROUP = 'GOOGLE_SERP';

export const GOOGLE_DEFAULT_RESULTS_PER_PAGE = 10;
