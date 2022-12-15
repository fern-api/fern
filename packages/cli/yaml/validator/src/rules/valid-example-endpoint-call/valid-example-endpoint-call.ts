import { constructFernFileContext, ErrorResolverImpl, TypeResolverImpl } from "@fern-api/ir-generator";
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

        return {
            serviceFile: {
                exampleHeaders: ({ service, endpoint, examples }, { relativeFilepath, contents: serviceFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...service.headers,
                            ...(typeof endpoint.request !== "string" ? endpoint.request?.headers : undefined),
                        },
                        examples,
                        parameterDisplayName: "header",
                        typeResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                examplePathParameters: (
                    { service, endpoint, examples },
                    { relativeFilepath, contents: serviceFile }
                ) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...service["path-parameters"],
                            ...endpoint["path-parameters"],
                        },
                        examples,
                        parameterDisplayName: "path parameter",
                        typeResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                exampleQueryParameters: ({ endpoint, examples }, { relativeFilepath, contents: serviceFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations:
                            typeof endpoint.request !== "string" ? endpoint.request?.["query-parameters"] : undefined,
                        examples,
                        parameterDisplayName: "query parameter",
                        typeResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                exampleRequest: ({ endpoint, example }, { relativeFilepath, contents: serviceFile }) => {
                    return validateRequest({
                        example,
                        endpoint,
                        typeResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        workspace,
                    });
                },
                exampleResponse: ({ endpoint, example }, { relativeFilepath, contents: serviceFile }) => {
                    return validateResponse({
                        example,
                        endpoint,
                        typeResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        workspace,
                        errorResolver,
                    });
                },
            },
        };
    },
};
