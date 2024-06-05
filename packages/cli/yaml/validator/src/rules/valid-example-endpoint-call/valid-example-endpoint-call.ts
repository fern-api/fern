import {
    constructFernFileContext,
    ErrorResolverImpl,
    ExampleResolverImpl,
    resolvePathParameter,
    TypeResolverImpl,
    VariableResolverImpl
} from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateExampleEndpointCallParameters } from "./validateExampleEndpointCallParameters";
import { validateRequest } from "./validateRequest";
import { validateResponse } from "./validateResponse";

export const ValidExampleEndpointCallRule: Rule = {
    name: "valid-example-endpoint-call",
    create: async ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const errorResolver = new ErrorResolverImpl(workspace);
        const exampleResolver = new ExampleResolverImpl(typeResolver);
        const variableResolver = new VariableResolverImpl();

        const workspaceDefinitionRootFile = (await workspace.getDefinition()).rootApiFile;

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
                                rootApiFile: workspaceDefinitionRootFile.contents
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
                            ...workspaceDefinitionRootFile.contents["path-parameters"],
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
                                    rootApiFile: workspaceDefinitionRootFile.contents
                                })
                            })
                    });
                },
                exampleQueryParameters: ({ endpoint, examples }, { relativeFilepath, contents: definitionFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations:
                            typeof endpoint.request !== "string" ? endpoint.request?.["query-parameters"] : undefined,
                        examples,
                        parameterDisplayName: "query parameter",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        getRawType: (queryParameter) => ({
                            file: constructFernFileContext({
                                relativeFilepath,
                                definitionFile,
                                casingsGenerator: CASINGS_GENERATOR,
                                rootApiFile: workspaceDefinitionRootFile.contents
                            }),
                            rawType: typeof queryParameter === "string" ? queryParameter : queryParameter.type
                        })
                    });
                },
                exampleRequest: async ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return await validateRequest({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspaceDefinitionRootFile.contents
                        }),
                        workspace
                    });
                },
                exampleResponse: async ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return await validateResponse({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspaceDefinitionRootFile.contents
                        }),
                        workspace,
                        errorResolver
                    });
                }
            }
        };
    }
};
