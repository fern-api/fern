import { AbsoluteFilePath, dirname, resolve } from "@fern-api/core-utils";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
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
                ? rawGeneratorsConfiguration.release.map((draftInvocation) => {
                      return {
                          type: "release",
                          name: draftInvocation.name,
                          version: draftInvocation.version,
                          outputs: {
                              npm:
                                  draftInvocation.outputs.npm != null
                                      ? {
                                            url: draftInvocation.outputs.npm.url,
                                            packageName: draftInvocation.outputs.npm["package-name"],
                                            token: draftInvocation.outputs.npm.token,
                                        }
                                      : undefined,
                              maven:
                                  draftInvocation.outputs.maven != null
                                      ? {
                                            url: draftInvocation.outputs.maven.url,
                                            coordinate: draftInvocation.outputs.maven.coordinate,
                                            username: draftInvocation.outputs.maven.username,
                                            password: draftInvocation.outputs.maven.password,
                                        }
                                      : undefined,
                              github:
                                  draftInvocation.outputs.github != null
                                      ? {
                                            repository: draftInvocation.outputs.github.repository,
                                        }
                                      : undefined,
                          },
                          config: draftInvocation.config,
                      };
                  })
                : [],
    };
}
