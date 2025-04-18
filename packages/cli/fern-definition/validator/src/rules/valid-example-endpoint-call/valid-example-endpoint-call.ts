import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ErrorResolverImpl,
    ExampleResolverImpl,
    TypeResolverImpl,
    VariableResolverImpl,
    constructFernFileContext,
    getEndpointPathParameters,
    resolvePathParameter
} from "@fern-api/ir-generator";

import { Rule } from "../../Rule";
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
                        }),
                        breadcrumbs: ["headers"]
                    });
                },
                examplePathParameters: (
                    { service, endpoint, examples },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: getAllPathParameterDeclarations({
                            workspace,
                            service,
                            endpoint
                        }),
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
                            }),
                        breadcrumbs: ["path-parameters"]
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
                                rootApiFile: workspace.definition.rootApiFile.contents
                            }),
                            rawType: typeof queryParameter === "string" ? queryParameter : queryParameter.type
                        }),
                        breadcrumbs: ["query-parameters"]
                    });
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

function getAllPathParameterDeclarations({
    workspace,
    service,
    endpoint
}: {
    workspace: FernWorkspace;
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
}): Record<string, RawSchemas.HttpPathParameterSchema> {
    const endpointPathParameters = getEndpointPathParameters(endpoint);
    return endpoint["base-path"] != null
        ? { ...endpointPathParameters }
        : {
              ...workspace.definition.rootApiFile.contents["path-parameters"],
              ...service["path-parameters"],
              ...endpointPathParameters
          };
}
