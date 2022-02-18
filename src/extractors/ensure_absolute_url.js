/**
 * @param {string} maybeUrl
 * @param {string} hostname
 */
exports.ensureItsAbsoluteUrl = (maybeUrl, hostname) => {
    return new URL(maybeUrl, (
        hostname.startsWith('http') ? '' : 'https://'
    ).concat(hostname)).toString();
};
