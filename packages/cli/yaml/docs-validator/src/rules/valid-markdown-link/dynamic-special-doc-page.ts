const DYNAMIC_SPEC_PATTERN = /^\/(openapi|asyncapi)\/.+\.(json|ya?ml)$/;

/**
 * Matches dynamic API spec paths served by the docs platform,
 * e.g. /openapi/51d85717-e70a-4282-b075-66851cd0af2b.json
 */
export function isDynamicSpecialDocPage(pathname: string, basePath?: string): boolean {
    if (DYNAMIC_SPEC_PATTERN.test(pathname)) {
        return true;
    }
    if (basePath != null) {
        const normalizedBase = basePath.startsWith("/") ? basePath : `/${basePath}`;
        if (pathname.startsWith(normalizedBase)) {
            const withoutBase = pathname.slice(normalizedBase.length);
            return DYNAMIC_SPEC_PATTERN.test(withoutBase);
        }
    }
    return false;
}
