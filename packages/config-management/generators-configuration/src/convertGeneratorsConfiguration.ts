import path from "path";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration,
}: {
    absolutePathToGeneratorsConfiguration: string;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): GeneratorsConfiguration {
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        generators: rawGeneratorsConfiguration.generators.map((generatorInvocation) => {
            return {
                name: generatorInvocation.name,
                version: generatorInvocation.version,
                generate:
                    generatorInvocation.generate != null
                        ? {
                              absolutePathToLocalOutput:
                                  generatorInvocation.generate !== true && generatorInvocation.generate.output != null
                                      ? path.resolve(
                                            path.dirname(absolutePathToGeneratorsConfiguration),
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
