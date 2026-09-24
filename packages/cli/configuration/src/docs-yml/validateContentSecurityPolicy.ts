// A CSP hash source without its quotes: an algorithm prefix and a base64 digest of that algorithm's length.
const CSP_HASH_SOURCE_REGEX = /^(?:sha256-[A-Za-z0-9+/]{43}=|sha384-[A-Za-z0-9+/]{64}|sha512-[A-Za-z0-9+/]{86}==)$/;

export const MAX_CSP_STYLE_HASHES = 16;

export function validateCspStyleHash(hash: string): string | undefined {
    if (CSP_HASH_SOURCE_REGEX.test(hash)) {
        return undefined;
    }
    if (/^["'].*["']$/.test(hash)) {
        return `Hash ${JSON.stringify(hash)} must not be quoted. Write it as sha256-<base64>`;
    }
    return `Hash ${JSON.stringify(hash)} is not a valid CSP hash source. Expected sha256-, sha384- or sha512- followed by the base64 digest, e.g. sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=`;
}

export function getContentSecurityPolicyErrors(styleHashes: string[] | undefined): string[] {
    if (styleHashes == null) {
        return [];
    }
    const errors: string[] = [];
    if (styleHashes.length > MAX_CSP_STYLE_HASHES) {
        errors.push(
            `settings.content-security-policy.style-hashes: at most ${MAX_CSP_STYLE_HASHES} hashes are allowed, got ${styleHashes.length}`
        );
    }
    styleHashes.forEach((hash, index) => {
        const error = validateCspStyleHash(hash);
        if (error != null) {
            errors.push(`settings.content-security-policy.style-hashes[${index}]: ${error}`);
        }
    });
    return errors;
}
