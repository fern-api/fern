import { AbsoluteFilePath, dirname, resolve } from "@fern-api/core-utils";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export function convertGeneratorsConfiguration({
    pathToFernDirectory,
    pathToGeneratorsConfiguration,
    rawGeneratorsConfiguration,
}: {
    pathToFernDirectory: AbsoluteFilePath;
    pathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): GeneratorsConfiguration {
    return {
        pathToConfiguration: pathToGeneratorsConfiguration,
        rawConfiguration: rawGeneratorsConfiguration,
        draft:
            rawGeneratorsConfiguration.draft != null
                ? rawGeneratorsConfiguration.draft.map((draftInvocation) => {
                      return {
                          type: "draft",
                          name: draftInvocation.name,
                          version: draftInvocation.version,
                          shouldPublishToFernRegistry: draftInvocation["publish-to-fern-registry"] ?? true,
                          pathToLocalOutput:
                              draftInvocation["output-directory"] != null
                                  ? resolve(dirname(pathToFernDirectory), draftInvocation["output-directory"])
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
                                            token: draftInvocation.outputs.github.token,
                                        }
                                      : undefined,
                          },
                          config: draftInvocation.config,
                      };
                  })
                : [],
    };
}
