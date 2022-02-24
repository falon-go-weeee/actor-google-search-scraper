/**
 * @param {string} maybeUrl Can be a path, like /search, or a full URL
 * @param {string} maybeHostname Can be a hostname, like www.google.com or full URL, like https://www.google.com
 */
exports.ensureItsAbsoluteUrl = (maybeUrl, maybeHostname) => {
    if (!maybeUrl?.trim?.().length || !maybeHostname?.trim?.().length) {
        return maybeUrl;
    }

    return new URL(maybeUrl, (
        maybeHostname.startsWith('http') ? '' : 'https://'
    ).concat(maybeHostname)).toString();
};
