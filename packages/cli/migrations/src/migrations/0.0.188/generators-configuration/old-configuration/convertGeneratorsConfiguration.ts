import { AbsoluteFilePath, dirname, resolve } from "@fern-api/core-utils";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export function convertGeneratorsConfiguration({
    pathToGeneratorsConfiguration,
    rawGeneratorsConfiguration,
}: {
    pathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): GeneratorsConfiguration {
    return {
        pathToConfiguration: pathToGeneratorsConfiguration,
        rawConfiguration: rawGeneratorsConfiguration,
        generators: rawGeneratorsConfiguration.generators.map((generatorInvocation) => {
            return {
                name: generatorInvocation.name,
                version: generatorInvocation.version,
                generate:
                    generatorInvocation.generate != null
                        ? {
                              pathToLocalOutput:
                                  generatorInvocation.generate !== true && generatorInvocation.generate.output != null
                                      ? resolve(
                                            dirname(pathToGeneratorsConfiguration),
                                            generatorInvocation.generate.output
                                        )
                                      : undefined,
                          }
                        : undefined,
                config: generatorInvocation.config,
            };
        }),
    };
}
