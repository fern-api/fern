import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    Argument,
    ClassReference,
    ClassReferenceFactory,
    Class_,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
    GeneratedRubyFile,
    GenericClassReference,
    getLocationFromFernFilepath,
    HashInstance,
    HashReference,
    Import,
    LongClassReference,
    Module_,
    Parameter,
    Property,
    StringClassReference,
    Variable,
    VariableType
} from "@fern-api/ruby-codegen";
import {
    AuthSchemesRequirement,
    EnvironmentId,
    EnvironmentsConfig,
    IntermediateRepresentation,
    MultipleBaseUrlsEnvironments,
    Name,
    SingleBaseUrlEnvironments,
    Subpackage
} from "@fern-fern/ir-sdk/api";
import {
    getAdditionalHeaders,
    getAdditionalHeadersAsParameters,
    getAdditionalHeadersAsProperties,
    getAuthHeaders,
    getAuthHeadersAsParameters,
    getAuthHeadersAsProperties
} from "./Auth";

export function generateRootPackage(
    gemName: string,
    clientName: string,
    intermediateRepresentation: IntermediateRepresentation,
    crf: ClassReferenceFactory
): GeneratedRubyFile {
    const classReference = new ClassReference({
        name: "Client",
        import_: new Import({ from: gemName, isExternal: false })
    });
    const clientFunction = generateRequestClientInitializer(
        false,
        intermediateRepresentation,
        crf,
        classReference,
        "",
        ""
    );

    // Add Client class
    const clientClass = new Class_({
        classReference,
        functions: [
            new Function_({
                name: "initialize",
                functionBody: [
                    new Expression({ leftSide: "request_client", rightSide: "TODO" })
                    // TODO: per package
                    // new Expression({})
                ],
                parameters: clientFunction.parameters
            })
            // TODO: If there's a root package then make those functions here
        ],
        includeInitializer: false
    });
    // Add Async Client class
    const asyncClientClass = new Class_({
        classReference: new ClassReference({
            name: "AsyncClient",
            import_: new Import({ from: gemName, isExternal: false })
        }),
        functions: [
            new Function_({
                name: "initialize",
                functionBody: [
                    new Expression({ leftSide: "request_client", rightSide: "TODO" })
                    // Per package
                    // new Expression({})
                ],
                parameters: clientFunction.parameters
            })
            // If there's a root package then make those functions here
        ],
        includeInitializer: false
    });

    const rootNode = Module_.wrapInModules(clientName, [clientClass, asyncClientClass]);
    return new GeneratedRubyFile({ rootNode, directoryPrefix: RelativeFilePath.of("."), name: `${gemName}.rb` });
}

export function generateSubPackage(clientName: string, subpackage: Subpackage): GeneratedRubyFile {
    const location = getLocationFromFernFilepath(subpackage.fernFilepath) + "_client";

    // Add Client class
    const clientClass = new Class_({
        classReference: new ClassReference({
            name: "Client",
            import_: new Import({ from: location, isExternal: false })
        }),
        properties: [new Property({ name: "client", type: new ClassReference({ name: "TODOMERGECLIENT" }) })],
        functions: [
            new Function_({
                name: "initialize",
                functionBody: [
                    // TODO: per package
                    // new Expression({})
                ],
                parameters: [new Parameter({ name: "client", type: new ClassReference({ name: "TODOMERGECLIENT" }) })]
            })
        ],
        includeInitializer: false
    });
    // Add Async Client class
    const asyncClientClass = new Class_({
        classReference: new ClassReference({
            name: "AsyncClient",
            import_: new Import({ from: location, isExternal: false })
        }),
        functions: [
            new Function_({
                name: "initialize",
                functionBody: [
                    // Per package
                    // new Expression({})
                ],
                parameters: [new Parameter({ name: "client", type: new ClassReference({ name: "TODOMERGECLIENT" }) })]
            })
        ],
        properties: [new Property({ name: "client", type: new ClassReference({ name: "TODOMERGECLIENT" }) })],
        includeInitializer: false
    });

    const rootNode = Module_.wrapInModules(clientName, [clientClass, asyncClientClass], subpackage.fernFilepath);
    return new GeneratedRubyFile({
        rootNode,
        directoryPrefix: RelativeFilePath.of(clientName),
        location: subpackage.fernFilepath,
        name: "_client.rb"
    });
}

// Need to create the environment file and then reference back to them via default_env@specified_url
// where specified_url is the single URL or the one specified for the service in multi-url envs
// TODO: This should also only be called once and stored for access
export function getEnvironments(environmentsConfig: EnvironmentsConfig): Map<EnvironmentId, Name> {
    return environmentsConfig.environments._visit<Map<EnvironmentId, Name>>({
        singleBaseUrl: (sbue: SingleBaseUrlEnvironments) => new Map(sbue.environments.map((e) => [e.id, e.name])),
        multipleBaseUrls: (mbue: MultipleBaseUrlsEnvironments) => new Map(mbue.environments.map((e) => [e.id, e.name])),
        _other: () => {
            throw new Error("Unknown environments configuration has been provided.");
        }
    });
}

export function getDefaultEnvironmentUrl(environmentsConfig: EnvironmentsConfig): string | undefined {
    if (
        environmentsConfig.defaultEnvironment !== undefined &&
        environmentsConfig.environments.type !== "multipleBaseUrls"
    ) {
        return `Environment::${
            getEnvironments(environmentsConfig).get(environmentsConfig.defaultEnvironment)?.screamingSnakeCase.safeName
        }`;
    }
    return;
}

// Actually might just be: be able to reference the default + create the files, it looks like endpoints
export function generateEnvironmentConstants(
    clientName: string,
    environmentsConfig: EnvironmentsConfig
): GeneratedRubyFile {
    const environmentClass = new Class_({
        classReference: new ClassReference({ name: "Environment", location: "environment" }),
        expressions: environmentsConfig.environments._visit<Expression[]>({
            singleBaseUrl: (sbue: SingleBaseUrlEnvironments) =>
                sbue.environments.map(
                    (e) =>
                        new Expression({
                            leftSide: e.name.screamingSnakeCase.safeName,
                            rightSide: `"${e.url}"`,
                            isAssignment: true
                        })
                ),
            multipleBaseUrls: (mbue: MultipleBaseUrlsEnvironments) =>
                mbue.environments.map(
                    (e) =>
                        new Expression({
                            leftSide: e.name.screamingSnakeCase.safeName,
                            rightSide: new HashInstance({
                                contents: new Map(Object.entries(e.urls).map(([key, url]) => [key, url])),
                                isFrozen: true
                            }),
                            isAssignment: true
                        })
                ),
            _other: () => {
                throw new Error("Unknown environments configuration has been provided.");
            }
        }),
        includeInitializer: false
    });
    const rootNode = Module_.wrapInModules(clientName, environmentClass);
    return new GeneratedRubyFile({ rootNode, directoryPrefix: RelativeFilePath.of("."), name: "environment.rb" });
}

function generateRequestClientInitializer(
    isAsync: boolean,
    intermediateRepresentation: IntermediateRepresentation,
    crf: ClassReferenceFactory,
    classReference: ClassReference,
    clientName: string,
    sdkVersion: string | undefined
): Function_ {
    const allHeaders = new Map([
        // SDK Default Headers
        [`"${intermediateRepresentation.sdkConfig.platformHeaders.language}"`, "Ruby"],
        [`"${intermediateRepresentation.sdkConfig.platformHeaders.sdkName}"`, clientName],
        // Auth Default Headers
        ...getAdditionalHeaders(intermediateRepresentation.headers)
    ]);
    if (sdkVersion !== undefined) {
        allHeaders.set(intermediateRepresentation.sdkConfig.platformHeaders.sdkVersion, sdkVersion);
    }

    // If "all" then require the param and always put it in, if optional
    // just add the header if it's there headers["name"] = value if value
    let authHeaders = new Map();
    const authHeaderSetters: Expression[] = [];
    const isAuthRequired = AuthSchemesRequirement._visit(intermediateRepresentation.auth.requirement, {
        all: () => true,
        any: () => false,
        _other: () => {
            throw new Error("Unrecognized auth requirement.");
        }
    });

    const authHeaderParameters = intermediateRepresentation.auth.schemes.flatMap((scheme) =>
        getAuthHeadersAsParameters(scheme, isAuthRequired)
    );
    const authHeaderProperties = intermediateRepresentation.auth.schemes.flatMap((scheme) =>
        getAuthHeadersAsProperties(scheme, isAuthRequired)
    );

    if (isAuthRequired) {
        authHeaders = new Map(intermediateRepresentation.auth.schemes.map((scheme) => getAuthHeaders(scheme)));
    } else {
        // Make an if statement for each auth scheme that adds the header if present
        authHeaderProperties.forEach(
            (prop) =>
                new ConditionalStatement({
                    if_: {
                        rightSide: new FunctionInvocation({
                            onObject: prop.name,
                            baseFunction: new Function_({ name: "nil?", functionBody: [] })
                        }),
                        operation: "!",
                        expressions: [
                            new FunctionInvocation({
                                onObject: "@headers",
                                baseFunction: new Function_({ name: "store", functionBody: [] }),
                                arguments_: [
                                    new Argument({
                                        isNamed: false,
                                        value: prop.wireValue ?? prop.name,
                                        type: StringClassReference
                                    }),
                                    new Argument({ isNamed: false, value: prop.name, type: StringClassReference })
                                ]
                            })
                        ]
                    }
                })
        );
    }

    const retriesVariable = new Variable({
        name: "max_retries",
        type: LongClassReference,
        isOptional: true,
        variableType: VariableType.LOCAL
    });

    const retryOptions = new HashInstance({ contents: new Map([["max", retriesVariable]]) });
    const faradayConfiguration = [
        new Expression({ leftSide: "faraday.request", rightSide: ":json", isAssignment: false }),
        new Expression({
            leftSide: "faraday.request",
            rightSide: new Expression({
                leftSide: new ClassReference({
                    name: ":retry",
                    import_: new Import({ from: "faraday/retry", isExternal: true })
                }),
                rightSide: retryOptions,
                operation: ", "
            }),
            isAssignment: false
        }),
        new Expression({ leftSide: "faraday.options.timeout", rightSide: "timeout_in_seconds", isAssignment: true })
    ];

    if (isAsync) {
        faradayConfiguration.push(
            new Expression({
                leftSide: "faraday.adapter",
                rightSide: new ClassReference({
                    name: ":async_http",
                    import_: new Import({ from: "async/http/faraday", isExternal: true })
                }),
                isAssignment: true
            })
        );
    }

    return new Function_({
        name: "initialize",
        parameters: [
            new Parameter({
                name: "environment",
                type: StringClassReference,
                defaultValue: intermediateRepresentation.environments
                    ? getDefaultEnvironmentUrl(intermediateRepresentation.environments)
                    : undefined,
                isOptional: true
            }),
            // Select sample of the request overrides object properties
            new Parameter({
                name: "max_retries",
                type: LongClassReference,
                isOptional: true,
                documentation: "The number of times to retry a failed request, defaults to 2."
            }),
            new Parameter({ name: "timeout_in_seconds", type: LongClassReference, isOptional: true }),
            // Auth headers
            ...authHeaderParameters,
            // Global headers
            ...getAdditionalHeadersAsParameters(intermediateRepresentation.headers, crf)
        ],
        returnValue: classReference,
        functionBody: [
            new Expression({
                leftSide: "@base_url",
                rightSide: "environment",
                isAssignment: true
            }),
            // Set the header
            new Expression({
                leftSide: "@headers",
                rightSide: new HashInstance({ contents: new Map([...allHeaders.entries(), ...authHeaders.entries()]) }),
                isAssignment: true
            }),
            ...authHeaderSetters,
            // Set the Faraday connection
            new Expression({
                leftSide: "@conn",
                rightSide: new FunctionInvocation({
                    onObject: new ClassReference({
                        name: "Faraday",
                        import_: new Import({ from: "faraday", isExternal: true })
                    }),
                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                    arguments_: [
                        new Argument({ isNamed: false, type: StringClassReference, value: "@base_url" }),
                        new Argument({
                            isNamed: true,
                            name: "headers",
                            type: new HashReference({ keyType: StringClassReference, valueType: StringClassReference }),
                            value: "@headers"
                        })
                    ],
                    block: { arguments: "faraday", expressions: faradayConfiguration }
                }),
                isAssignment: true
            })
        ]
    });
}

export function generateRequestClients(
    intermediateRepresentation: IntermediateRepresentation,
    crf: ClassReferenceFactory,
    clientName: string,
    sdkVersion: string | undefined
): GeneratedRubyFile {
    const faradayReference = new ClassReference({
        name: "Faraday",
        import_: new Import({ from: "faraday", isExternal: true })
    });
    // Client properties
    const clientProperties = [
        new Property({
            name: "headers",
            type: new HashReference({ keyType: StringClassReference, valueType: StringClassReference })
        }),
        new Property({ name: "base_url", type: StringClassReference }),
        new Property({ name: "conn", type: faradayReference })
    ];
    // Add Client class
    const clientClassReference = new ClassReference({ name: "RequestClient", location: "requests" });
    const clientClass = new Class_({
        classReference: clientClassReference,
        functions: [
            generateRequestClientInitializer(
                false,
                intermediateRepresentation,
                crf,
                clientClassReference,
                clientName,
                sdkVersion
            )
        ],
        properties: clientProperties,
        includeInitializer: false
    });

    // Add Async Client class
    const asyncClientClassReference = new ClassReference({ name: "AsyncRequestClient", location: "requests" });
    const asyncClientClass = new Class_({
        classReference: asyncClientClassReference,
        functions: [
            generateRequestClientInitializer(
                true,
                intermediateRepresentation,
                crf,
                asyncClientClassReference,
                clientName,
                sdkVersion
            )
        ],
        properties: clientProperties,
        includeInitializer: false
    });

    // Add Request Options class
    const requestOptionsClass = new Class_({
        classReference: new ClassReference({ name: "RequestOptions", location: "requests" }),
        includeInitializer: true,
        properties: [
            new Property({
                name: "max_retries",
                type: LongClassReference,
                isOptional: true,
                documentation: "The number of times to retry a failed request, defaults to 2."
            }),
            new Property({ name: "timeout_in_seconds", type: LongClassReference, isOptional: true }),
            // Auth headers
            ...intermediateRepresentation.auth.schemes.flatMap((scheme) => getAuthHeadersAsProperties(scheme, true)),
            // Global headers
            ...getAdditionalHeadersAsProperties(intermediateRepresentation.headers, crf),
            // Generic overrides
            new Property({
                name: "additional_headers",
                type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
                isOptional: true
            }),
            new Property({
                name: "additional_query_parameters",
                type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
                isOptional: true
            }),
            new Property({
                name: "additional_body_parameters",
                type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
                isOptional: true
            })
        ],
        documentation: "Additional options for request-specific configuration when calling APIs via the SDK."
    });

    const rootNode = Module_.wrapInModules(clientName, [clientClass, asyncClientClass, requestOptionsClass]);
    return new GeneratedRubyFile({ rootNode, directoryPrefix: RelativeFilePath.of("."), name: "requests.rb" });
}
