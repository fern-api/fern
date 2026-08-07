import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { ServerUrlVariable, urlTemplateToStringLiteral } from "./serverUrlVariables.js";

const URL_METHOD_NAME = "url";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        enumName: string;
        environments: FernIr.SingleBaseUrlEnvironments;
        serverUrlVariables: ServerUrlVariable[];
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SingleUrlEnvironmentGenerator {
    private readonly enumName: string;
    private readonly environments: FernIr.SingleBaseUrlEnvironments;
    private readonly serverUrlVariables: ServerUrlVariable[];
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({
        enumName,
        environments,
        serverUrlVariables,
        sdkGeneratorContext
    }: SingleUrlEnvironmentGenerator.Args) {
        this.enumName = enumName;
        this.environments = environments;
        this.serverUrlVariables = serverUrlVariables;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: this.enumName,
            accessLevel: swift.AccessLevel.Public,
            conformances: ["String", swift.Protocol.CaseIterable],
            cases: this.environments.environments.map((e) => ({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(e.name),
                rawValue: e.url,
                docs: e.docs ? swift.docComment({ summary: e.docs }) : undefined
            }))
        });
    }

    /**
     * Generates a `url(...)` method that resolves an environment's URL template with the given
     * server URL variables. Returns undefined when the API does not use URL templating.
     */
    public generateUrlVariablesExtension(): swift.Extension | undefined {
        if (this.serverUrlVariables.length === 0) {
            return undefined;
        }
        return swift.extension({
            name: this.enumName,
            methods: [
                swift.method({
                    unsafeName: URL_METHOD_NAME,
                    accessLevel: swift.AccessLevel.Public,
                    parameters: this.serverUrlVariables.map(({ name }) =>
                        swift.functionParameter({
                            argumentLabel: name,
                            unsafeName: name,
                            type: swift.TypeReference.optional(swift.TypeReference.unqualifiedToSwiftType("String")),
                            defaultValue: swift.Expression.nil()
                        })
                    ),
                    returnType: swift.TypeReference.unqualifiedToSwiftType("String"),
                    body: swift.CodeBlock.withStatements([
                        swift.Statement.switch({
                            target: swift.Expression.self(),
                            cases: this.environments.environments.map((environment) => ({
                                pattern: swift.Expression.enumCaseShorthand(
                                    this.sdkGeneratorContext.caseConverter.camelUnsafe(environment.name)
                                ),
                                body: [
                                    swift.Statement.return(
                                        swift.Expression.rawValue(
                                            urlTemplateToStringLiteral(
                                                environment.urlTemplate ?? environment.url,
                                                this.serverUrlVariables
                                            )
                                        )
                                    )
                                ]
                            }))
                        })
                    ]),
                    docs: swift.docComment({
                        summary:
                            "Returns this environment's URL with the given server URL variables substituted in. Variables that are not provided fall back to their defaults."
                    })
                })
            ]
        });
    }
}
