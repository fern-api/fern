import { GeneratorError, NamedArgument } from "@fern-api/base-generator";
import { ast } from "@fern-api/csharp-codegen";

import { MultiUrlEnvironmentGenerator } from "../../environment/MultiUrlEnvironmentGenerator.js";
import { RootClientGenerator } from "../../root-client/RootClientGenerator.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Instantiates the root client against the running WireMock server. Additional client
 * options (e.g. the SDK variables an individual test needs) are appended to the default
 * BaseUrl/Environment and MaxRetries options.
 */
export function generateMockServerClientInstantiation({
    context,
    rootClientGenerator,
    additionalClientOptions = []
}: {
    context: SdkGeneratorContext;
    rootClientGenerator: RootClientGenerator;
    additionalClientOptions?: NamedArgument[];
}): ast.ClassInstantiation {
    const { csharp, Types } = context.generation;
    return rootClientGenerator.generateExampleClientInstantiationSnippet({
        includeEnvVarArguments: true,
        asSnippet: false,
        clientOptionsArgument: csharp.instantiateClass({
            classReference: Types.ClientOptions,
            arguments_: [
                context.ir.environments?.environments._visit<NamedArgument>({
                    singleBaseUrl: () => ({
                        name: "BaseUrl",
                        assignment: csharp.codeblock("Server.Urls[0]")
                    }),
                    multipleBaseUrls: (value) => {
                        const environments = new MultiUrlEnvironmentGenerator({
                            context,
                            multiUrlEnvironments: value
                        });
                        return {
                            name: "Environment",
                            assignment: environments.generateSnippet(csharp.codeblock("Server.Urls[0]"))
                        };
                    },
                    _other: () => {
                        throw GeneratorError.internalError("Internal error; Unexpected environment type");
                    }
                }) ?? {
                    name: "BaseUrl",
                    assignment: csharp.codeblock("Server.Urls[0]")
                },
                { name: "MaxRetries", assignment: csharp.codeblock("0") },
                ...additionalClientOptions
            ]
        })
    });
}
