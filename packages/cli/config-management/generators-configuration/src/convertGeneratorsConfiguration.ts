import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { getOutputModeForDraft } from "./getOutputModeForDraft";
import { getOutputModeForRelease } from "./getOutputModeForRelease";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

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
                          absolutePathToLocalOutput:
                              draftInvocation["output-path"] != null
                                  ? resolve(
                                        dirname(absolutePathToGeneratorsConfiguration),
                                        draftInvocation["output-path"]
                                    )
                                  : undefined,
                          config: draftInvocation.config,
                          outputMode: getOutputModeForDraft(draftInvocation),
                          audiences: draftInvocation.audiences ?? [],
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
                          config: releaseInvocation.config,
                          outputMode: getOutputModeForRelease(releaseInvocation),
                          audiences: releaseInvocation.audiences ?? [],
                      };
                  })
                : [],
    };
}
