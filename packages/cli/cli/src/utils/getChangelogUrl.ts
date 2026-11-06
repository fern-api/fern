const CHANGELOG_BASE = "https://buildwithfern.com/learn/sdks/generators";

/**
 * Derives the changelog URL from a generator name.
 * Generator names follow the pattern "fernapi/fern-<language>-sdk[-variant]",
 * and changelog pages live at buildwithfern.com/learn/sdks/generators/<language>/changelog.
 */
export function getChangelogUrl(generatorName: string): string | undefined {
    const match = generatorName.match(/^fernapi\/fern-([a-z]+)/);
    if (!match?.[1]) {
        return undefined;
    }
    return `${CHANGELOG_BASE}/${match[1]}/changelog`;
}
