export function getDocsYmlSlug(configuredSlug: string | undefined, fallbackSlug: string): string {
    if (configuredSlug == null) {
        return fallbackSlug;
    }
    return configuredSlug === "/" ? "" : configuredSlug;
}
