import { AbsoluteFilePath, assertNever, dirname, resolve } from "@fern-api/core-utils";
import { GeneratorsConfiguration, MavenGeneratorPublishing, NpmGeneratorPublishing } from "./GeneratorsConfiguration";
import { GeneratorPublishingSchema } from "./schemas/GeneratorPublishingSchema";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";
import { MavenPublishingSchema } from "./schemas/MavenPublishingSchema";
import { NpmPublishingSchema } from "./schemas/NpmPublishingSchema";

export function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration,
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): GeneratorsConfiguration {
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        rawConfiguration: rawGeneratorsConfiguration,
        draft:
            rawGeneratorsConfiguration.draft != null
                ? rawGeneratorsConfiguration.draft.map((draftInvocation) => {
                      return {
                          type: "draft",
                          name: draftInvocation.name,
                          version: draftInvocation.version,
                          mode: draftInvocation.mode,
                          absolutePathToLocalOutput:
                              draftInvocation["output-path"] != null
                                  ? resolve(
                                        dirname(absolutePathToGeneratorsConfiguration),
                                        draftInvocation["output-path"]
                                    )
                                  : undefined,
                          config: draftInvocation.config,
                      };
                  })
                : [],
        release:
            rawGeneratorsConfiguration.release != null
                ? rawGeneratorsConfiguration.release.map((releaseInvocation) => {
                      return {
                          type: "release",
                          name: releaseInvocation.name,
                          version: releaseInvocation.version,
                          publishing: convertReleasePublishing(releaseInvocation.publishing),
                          github: releaseInvocation.github,
                          config: releaseInvocation.config,
                      };
                  })
                : [],
    };
}

function convertReleasePublishing(
    rawGeneratorPublishing: GeneratorPublishingSchema
): NpmGeneratorPublishing | MavenGeneratorPublishing {
    if (isNpmPublishing(rawGeneratorPublishing)) {
        return {
            type: "npm",
            url: rawGeneratorPublishing.npm.url,
            token: rawGeneratorPublishing.npm.token,
            packageName: rawGeneratorPublishing.npm["package-name"],
        };
    } else if (isMavenPublishing(rawGeneratorPublishing)) {
        return {
            type: "maven",
            url: rawGeneratorPublishing.maven.url,
            username: rawGeneratorPublishing.maven.username,
            password: rawGeneratorPublishing.maven.password,
            coordinate: rawGeneratorPublishing.maven.coordinate,
        };
    }
    assertNever(rawGeneratorPublishing);
}

function isNpmPublishing(rawPublishingSchema: GeneratorPublishingSchema): rawPublishingSchema is NpmPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as NpmPublishingSchema).npm != null;
}

function isMavenPublishing(
    rawPublishingSchema: GeneratorPublishingSchema
): rawPublishingSchema is MavenPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as MavenPublishingSchema).maven != null;
}
