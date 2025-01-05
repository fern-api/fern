import semver from "semver";

import { TaskContext } from "@fern-api/task-context";

import { FernRegistry, FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";

export async function getLatestGeneratorVersion({
    generatorName,
    cliVersion,
    channel,
    currentGeneratorVersion,
    includeMajor,
    context
}: {
    generatorName: string;
    cliVersion: string;
    channel: FernRegistry.generators.ReleaseType | undefined;
    currentGeneratorVersion?: string;
    includeMajor?: boolean;
    context?: TaskContext;
}): Promise<string | undefined> {
    const parsedVersion = semver.parse(currentGeneratorVersion);
    // We're just using unauthed endpoints, so we don't need to pass in a token
    const client = new GeneratorsClient({
        environment: process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    });
    context?.logger.debug(
        `Getting latest version for ${generatorName} with CLI version ${cliVersion}, includeMajor: ${includeMajor}, prior version: ${parsedVersion}`
    );

    const payload: FernRegistry.generators.versions.GetLatestGeneratorReleaseRequest = {
        generator: getGeneratorMetadataFromName(generatorName, context),
        releaseTypes: [channel ?? FernRegistry.generators.ReleaseType.Ga],
        // We get "*" as 0.0.0, so we need to handle that case for tests
        // if we see this, then we shouldn't restrict on the CLI version
        cliVersion: cliVersion === "0.0.0" ? undefined : cliVersion
    };

    if (!includeMajor && parsedVersion != null) {
        payload.generatorMajorVersion = parsedVersion.major;
    }

    const latestReleaseResponse = await client.generators.versions.getLatestGeneratorRelease(payload);

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
    if (generatorName.startsWith("fernapi/")) {
        generatorName = generatorName.replace("fernapi/", "");
    }
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
