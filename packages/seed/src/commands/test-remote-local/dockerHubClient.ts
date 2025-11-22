import type { Logger } from "@fern-api/logger";
import {
    DOCKER_HUB_API_BASE_URL,
    DOCKER_HUB_TAGS_ORDERING,
    DOCKER_HUB_TAGS_PAGE_SIZE,
    ERROR_DOCKER_HUB_API_FAILED,
    ERROR_FAILED_TO_FETCH_VERSION,
    ERROR_INVALID_GENERATOR_NAME,
    ERROR_NO_SEMVER_TAGS,
    ERROR_NO_TAGS_FOUND,
    GeneratorName,
    GeneratorNameFromNickname,
    GeneratorNickname,
    LOCAL_BUILD_VERSION,
    SEMVER_REGEX
} from "./constants";

/**
 * Fetches the latest versions for all specified generators from Docker Hub.
 * This should be called once at the beginning of a test run to avoid redundant API calls.
 */
export async function getLatestGeneratorVersions(
    generators: readonly GeneratorNickname[],
    logger: Logger
): Promise<Record<GeneratorName, string>> {
    const generatorNames = generators.map((nickname) => GeneratorNameFromNickname[nickname]);
    const uniqueGeneratorNames = Array.from(new Set(generatorNames));

    logger.debug(`Fetching versions for ${uniqueGeneratorNames.length} generator(s)`);

    const versions: Record<GeneratorName, string> = {} as Record<GeneratorName, string>;

    // Fetch all versions in parallel
    await Promise.all(
        uniqueGeneratorNames.map(async (generator) => {
            const version = await getLatestGeneratorVersion(generator, logger);
            versions[generator] = version;
            // Log immediately after fetching each version
            logger.info(`  Fetched ${generator}: ${version}`);
        })
    );

    return versions;
}

async function getLatestGeneratorVersion(generator: GeneratorName, logger: Logger): Promise<string> {
    logger.debug(`Getting latest version for ${generator} from Docker Hub`);

    try {
        // Extract repository name from generator (e.g., "fernapi/fern-typescript-sdk" -> "fern-typescript-sdk")
        const [namespace, repository] = generator.split("/");
        if (!namespace || !repository) {
            throw new Error(`${ERROR_INVALID_GENERATOR_NAME}: ${generator}`);
        }

        // Docker Hub API v2 endpoint for repository tags
        // Note: We need to fetch multiple pages to ensure we get all versions
        // The API returns paginated results, and ordering by last_updated may not give us the highest version first
        let allVersionTags: string[] = [];
        let nextUrl: string | null =
            `${DOCKER_HUB_API_BASE_URL}/repositories/${namespace}/${repository}/tags?page_size=${DOCKER_HUB_TAGS_PAGE_SIZE}&ordering=${DOCKER_HUB_TAGS_ORDERING}`;
        let pageCount = 0;
        const maxPages = 10; // Limit to prevent infinite loops

        while (nextUrl && pageCount < maxPages) {
            logger.debug(`Fetching page ${pageCount + 1} from: ${nextUrl}`);
            const response = await fetch(nextUrl);

            if (!response.ok) {
                throw new Error(`${ERROR_DOCKER_HUB_API_FAILED} ${response.status}: ${response.statusText}`);
            }

            const data = (await response.json()) as {
                results?: Array<{ name: string; last_updated?: string }>;
                next?: string | null;
            };

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error(`${ERROR_NO_TAGS_FOUND} ${generator}`);
            }

            logger.debug(`Fetched ${data.results.length} tags from page ${pageCount + 1}`);

            // Filter and collect semantic version tags
            const pageVersionTags = data.results.map((tag) => tag.name).filter((name) => SEMVER_REGEX.test(name));

            allVersionTags = allVersionTags.concat(pageVersionTags);
            logger.debug(`Found ${pageVersionTags.length} semantic version tags on page ${pageCount + 1}`);

            // Move to next page if available
            nextUrl = data.next ?? null;
            pageCount++;

            // If we've already found a good number of versions, we can stop early
            // Most repos won't have more than a few hundred versions
            if (allVersionTags.length >= 500) {
                logger.debug(`Found ${allVersionTags.length} versions, stopping pagination`);
                break;
            }
        }

        if (allVersionTags.length === 0) {
            throw new Error(`${ERROR_NO_SEMVER_TAGS} ${generator}`);
        }

        logger.debug(`Total semantic version tags found: ${allVersionTags.length}`);

        // Sort versions by semantic versioning rules (descending order)
        const sortedVersions = allVersionTags.sort((a: string, b: string) => {
            const aParts = a.split(".").map(Number);
            const bParts = b.split(".").map(Number);

            for (let i = 0; i < 3; i++) {
                const aPart = aParts[i] ?? 0;
                const bPart = bParts[i] ?? 0;
                if (aPart !== bPart) {
                    return bPart - aPart; // Descending order
                }
            }
            return 0;
        });

        const latestVersion = sortedVersions[0];
        if (!latestVersion) {
            throw new Error(`${ERROR_NO_SEMVER_TAGS} ${generator}`);
        }
        logger.debug(`Found latest version: ${latestVersion} (from ${sortedVersions.length} total versions)`);
        return latestVersion;
    } catch (error) {
        logger.error(
            `Failed to fetch version from Docker Hub: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new Error(
            `${ERROR_FAILED_TO_FETCH_VERSION} ${generator} from Docker Hub: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Returns LOCAL_BUILD_VERSION for all generators (used when generators are built locally)
 */
export async function getLocalGeneratorVersions(
    generators: readonly GeneratorNickname[],
    logger: Logger
): Promise<Record<GeneratorName, string>> {
    const generatorNames = generators.map((nickname) => GeneratorNameFromNickname[nickname]);
    const uniqueGeneratorNames = Array.from(new Set(generatorNames));

    logger.debug(`Using local version ${LOCAL_BUILD_VERSION} for ${uniqueGeneratorNames.length} generator(s)`);

    const versions: Record<GeneratorName, string> = {} as Record<GeneratorName, string>;

    for (const generator of uniqueGeneratorNames) {
        versions[generator] = LOCAL_BUILD_VERSION;
        logger.info(`  Using ${generator}: ${LOCAL_BUILD_VERSION} (locally built)`);
    }

    return versions;
}
