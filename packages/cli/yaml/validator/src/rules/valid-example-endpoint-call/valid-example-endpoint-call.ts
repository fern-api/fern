import {
    constructFernFileContext,
    ErrorResolverImpl,
    ExampleResolverImpl,
    resolvePathParameter,
    TypeResolverImpl,
    VariableResolverImpl
} from "@fern-api/ir-generator";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateExampleEndpointCallParameters } from "./validateExampleEndpointCallParameters";
import { validateRequest } from "./validateRequest";
import { validateResponse } from "./validateResponse";

export const ValidExampleEndpointCallRule: Rule = {
    name: "valid-example-endpoint-call",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const errorResolver = new ErrorResolverImpl(workspace);
        const exampleResolver = new ExampleResolverImpl(typeResolver);
        const variableResolver = new VariableResolverImpl();

        return {
            definitionFile: {
                exampleHeaders: ({ service, endpoint, examples }, { relativeFilepath, contents: definitionFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...service.headers,
                            ...(typeof endpoint.request !== "string" ? endpoint.request?.headers : undefined)
                        },
                        examples,
                        parameterDisplayName: "header",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        getRawType: (header) => ({
                            file: constructFernFileContext({
                                relativeFilepath,
                                definitionFile,
                                casingsGenerator: CASINGS_GENERATOR,
                                rootApiFile: workspace.definition.rootApiFile.contents
                            }),
                            rawType: typeof header === "string" ? header : header.type
                        })
                    });
                },
                examplePathParameters: (
                    { service, endpoint, examples },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...workspace.definition.rootApiFile.contents["path-parameters"],
                            ...service["path-parameters"],
                            ...endpoint["path-parameters"]
                        },
                        examples,
                        parameterDisplayName: "path parameter",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        getRawType: (pathParameter) =>
                            resolvePathParameter({
                                parameter: pathParameter,
                                variableResolver,
                                file: constructFernFileContext({
                                    relativeFilepath,
                                    definitionFile,
                                    casingsGenerator: CASINGS_GENERATOR,
                                    rootApiFile: workspace.definition.rootApiFile.contents
                                })
                            })
                    });
                },
                exampleQueryParameters: ({ endpoint, examples }, { relativeFilepath, contents: definitionFile }) => {
                    const validateQueryParams = (
                        schema: "single" | "array",
                        examplesToValidate: Record<string, unknown>
                    ): RuleViolation[] => {
                        return validateExampleEndpointCallParameters({
                            allDeclarations:
                                typeof endpoint.request !== "string"
                                    ? endpoint.request?.["query-parameters"]
                                    : undefined,
                            examples: examplesToValidate,
                            parameterDisplayName: "query parameter",
                            typeResolver,
                            exampleResolver,
                            workspace,
                            getRawType: (queryParameter) => {
                                let rawType = typeof queryParameter === "string" ? queryParameter : queryParameter.type;
                                if (
                                    schema === "array" &&
                                    typeof queryParameter !== "string" &&
                                    queryParameter["allow-multiple"] === true
                                ) {
                                    rawType = `list<${rawType}>`;
                                }
                                return {
                                    file: constructFernFileContext({
                                        relativeFilepath,
                                        definitionFile,
                                        casingsGenerator: CASINGS_GENERATOR,
                                        rootApiFile: workspace.definition.rootApiFile.contents
                                    }),
                                    rawType
                                };
                            }
                        });
                    };

                    const ruleViolations: RuleViolation[] = [];
                    for (const [name, example] of Object.entries(examples ?? {})) {
                        const ruleViolationsAsElement = validateQueryParams("single", { [name]: example });
                        const ruleViolationsAsArray = validateQueryParams("array", { [name]: example });
                        if (ruleViolationsAsElement.length > 0 && ruleViolationsAsArray.length > 0) {
                            ruleViolations.push(...ruleViolationsAsElement);
                        }
                    }
                    return ruleViolations;
                },
                exampleRequest: ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return validateRequest({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        }),
                        workspace
                    });
                },
                exampleResponse: ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return validateResponse({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        }),
                        workspace,
                        errorResolver
                    });
                }
            }
        };
    }
};
