export function ensureItsAbsoluteUrl(maybeUrl?: string | null, hostname?: string | null) {
    return hostname && maybeUrl && maybeUrl.startsWith('/')
        ? `https://${hostname}${maybeUrl}`
        : maybeUrl;
}
