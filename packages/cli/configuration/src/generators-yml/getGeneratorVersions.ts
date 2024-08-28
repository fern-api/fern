import { TaskContext } from "@fern-api/task-context";
import { FernRegistry, FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import semver from "semver";

export async function getLatestGeneratorVersion({
    generatorName,
    cliVersion,
    includeRc,
    currentGeneratorVersion,
    includeMajor,
    context
}: {
    generatorName: string;
    cliVersion: string;
    includeRc: boolean;
    currentGeneratorVersion?: string;
    includeMajor?: boolean;
    context?: TaskContext;
}): Promise<string | undefined> {
    const parsedVersion = semver.parse(currentGeneratorVersion);
    // We're just using unauthed endpoints, so we don't need to pass in a token
    const client = new GeneratorsClient({});
    const latestReleaseResponse = await client.generators.versions.getLatestGeneratorRelease({
        generator: getGeneratorMetadataFromName(generatorName, context),
        releaseType: includeRc ? FernRegistry.generators.ReleaseType.Rc : FernRegistry.generators.ReleaseType.Ga,
        retainMajorVersion: !includeMajor && parsedVersion != null ? parsedVersion.major : undefined,
        cliVersion
    });

    if (latestReleaseResponse.ok) {
        return latestReleaseResponse.body.version;
    }
    return undefined;
}

// HACK: Since none of the image names are really standardized, we need to manually map them to the language and generator type
// This should be removed in CLI v2, where langauge and type are codified within the config directly, without a docker image name
//
// Ideally we just do a lookup that's sdk type and language, but we need to do this for now, but we're looking to keep our options
// open when it comes to handling generators by some ID (and don't necessarily want to disallow multiple generators of the same type in the same language)
function getGeneratorMetadataFromName(generatorName: string, context?: TaskContext): string {
    switch (generatorName) {
        // Python
        case "fern-python-sdk":
            return "python-sdk";
        case "fern-pydantic-model":
            return "pydantic";
        case "fern-fastapi-server":
            return "fastapi";
        // TypeScript
        case "fern-typescript-browser-sdk":
        case "fern-typescript-node-sdk":
        case "fern-typescript-sdk":
            return "ts-sdk";
        case "fern-typescript-express":
            return "ts-express";
        // Java
        case "fern-java-sdk":
            return "java-sdk";
        case "java-model":
            return "java-model";
        case "fern-java-spring":
            return "java-spring";
        // Go
        case "fern-go-sdk":
            return "go-sdk";
        case "fern-go-model":
            return "go-model";
        case "fern-go-fiber":
            return "go-fiber";
        // C#
        case "fern-csharp-sdk":
            return "csharp-sdk";
        case "fern-csharp-model":
            return "csharp-model";
        // Ruby
        case "fern-ruby-sdk":
            return "ruby-sdk";
        case "fern-ruby-model":
            return "ruby-model";
        // Misc.
        case "fern-postman":
            return "postman";
        case "fern-openapi":
            return "openapi";

        default: {
            context?.logger.warn(`Unrecognized generator name found, attempting to parse manually: ${generatorName}`);
            if (generatorName.startsWith("fern-")) {
                return generatorName.replace("fern-", "");
            }
            return generatorName;
        }
    }
}
