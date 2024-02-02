import { RelativeFilePath } from "@fern-api/fs-utils";
import { generatePathTemplate } from "@fern-api/generator-commons";
import {
    Argument,
    AstNode,
    ClassReference,
    ClassReferenceFactory,
    Class_,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
    GeneratedRubyFile,
    GenericClassReference,
    getLocationForServiceDeclaration,
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
    EnvironmentId,
    EnvironmentsConfig,
    HttpEndpoint,
    HttpPath,
    HttpService,
    MultipleBaseUrlsEnvironments,
    Name,
    ObjectProperty,
    Package,
    PathParameter,
    SdkConfig,
    SingleBaseUrlEnvironments,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { snakeCase } from "lodash-es";
import { EndpointGenerator } from "./utils/EndpointGenerator";
import { FileUploadUtility } from "./utils/FileUploadUtility";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { RequestOptions } from "./utils/RequestOptionsClass";

export interface ClientClassPair {
    syncClientClass: Class_;
    asyncClientClass: Class_;
}

// TODO: Move this to ConfigUtilities.ts
// Note that these paths do not have leading or trailing slashes
export function generateRubyPathTemplate(pathParameters: PathParameter[], basePath?: HttpPath): string {
    return generatePathTemplate("#{%s}", pathParameters, basePath);
}
export function generateEndpoints(
    crf: ClassReferenceFactory,
    requestClientVariable: Variable,
    endpoints: HttpEndpoint[],
    requestOptions: RequestOptions,
    isAsync: boolean,
    irBasePath: string,
    serviceBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility
): Function_[] {
    return endpoints.map((endpoint) => {
        // throw new Error(endpoint.name.snakeCase.safeName + ": " + endpoint.path.parts);
        const path = [irBasePath, serviceBasePath, generateRubyPathTemplate(endpoint.pathParameters, endpoint.path)]
            .filter((pathPart) => pathPart !== "")
            .join("/");
        const responseVariable = new Variable({
            name: "response",
            type: GenericClassReference,
            variableType: VariableType.LOCAL
        });
        const requestOptionsVariable = new Variable({
            name: "request_options",
            type: requestOptions.classReference,
            variableType: VariableType.LOCAL
        });
        const generator = new EndpointGenerator(
            endpoint,
            requestOptionsVariable,
            requestOptions,
            crf,
            generatedClasses,
            fileUploadUtility
        );

        const functionCore: AstNode[] = [
            new Expression({
                leftSide: responseVariable,
                rightSide: new FunctionInvocation({
                    // TODO: Do this field access on the client better
                    onObject: `${requestClientVariable.write({})}.conn`,
                    baseFunction: new Function_({ name: endpoint.method.toLowerCase(), functionBody: [] }),
                    arguments_: [new Argument({ isNamed: false, value: `"/${path}"`, type: StringClassReference })],
                    block: generator.getFaradayBlock(requestClientVariable)
                }),
                isAssignment: true
            }),
            // TODO: parse and throw the custom exception here. Disable the faraday middleware that does this generically.
            ...(generator.getResponseExpressions(responseVariable) ?? [])
        ];

        return new Function_({
            name: endpoint.name.snakeCase.safeName,
            parameters: [
                ...generator.getEndpointParameters(),
                // Optional request_options, e.g. the per-request customizer, optional
                new Parameter({
                    name: requestOptionsVariable.name,
                    type: requestOptionsVariable.type,
                    isOptional: true
                })
            ],
            functionBody: isAsync
                ? [
                      new FunctionInvocation({
                          onObject: new ClassReference({
                              name: "Async",
                              import_: new Import({ from: "async", isExternal: true })
                          }),
                          block: { expressions: functionCore }
                      })
                  ]
                : functionCore,
            returnValue: generator.getResponseType(),
            crf,
            flattenedProperties
        });
    });
}

export function generateRootPackage(
    gemName: string,
    clientName: string,
    requestClient: Class_,
    asyncRequestClient: Class_,
    requestOptions: RequestOptions,
    crf: ClassReferenceFactory,
    syncSubpackages: Class_[],
    asyncSubpackages: Class_[],
    irBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility,
    rootService?: HttpService
): GeneratedRubyFile {
    const classReference = new ClassReference({
        name: "Client",
        import_: new Import({ from: gemName, isExternal: false })
    });

    // Add Client class
    const requestClientVariable = new Variable({
        name: "request_client",
        type: requestClient.classReference,
        variableType: VariableType.LOCAL
    });
    const clientClass = new Class_({
        classReference,
        functions: rootService
            ? generateEndpoints(
                  crf,
                  requestClientVariable,
                  rootService.endpoints,
                  requestOptions,
                  false,
                  irBasePath,
                  generateRubyPathTemplate(rootService.pathParameters, rootService.basePath),
                  generatedClasses,
                  flattenedProperties,
                  fileUploadUtility
              )
            : [],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            functionBody: [
                new Expression({
                    leftSide: requestClientVariable,
                    rightSide: new FunctionInvocation({
                        onObject: requestClient.classReference,
                        baseFunction: requestClient.initializer,
                        arguments_: requestClient.properties.map((prop) => prop.toArgument(prop.name, true))
                    }),
                    isAssignment: true
                }),
                ...syncSubpackages.map((sp) => {
                    const spInstanceVar = new Variable({
                        name: snakeCase(sp.classReference.name),
                        type: sp.classReference,
                        variableType: VariableType.INSTANCE
                    });
                    return new Expression({
                        leftSide: spInstanceVar,
                        rightSide: new FunctionInvocation({
                            onObject: sp.classReference,
                            baseFunction: sp.initializer,
                            arguments_: sp.properties.map((prop) => prop.toArgument(requestClientVariable, true))
                        }),
                        isAssignment: true
                    });
                })
            ],
            parameters: requestClient.initializer?.parameters
        })
    });

    // Add Async Client class
    const asyncRequestClientVariable = new Variable({
        name: "async_request_client",
        type: asyncRequestClient.classReference,
        variableType: VariableType.LOCAL
    });
    const asyncClientClass = new Class_({
        classReference: new ClassReference({
            name: "AsyncClient",
            import_: new Import({ from: gemName, isExternal: false })
        }),
        functions: rootService
            ? generateEndpoints(
                  crf,
                  requestClientVariable,
                  rootService.endpoints,
                  requestOptions,
                  false,
                  irBasePath,
                  generateRubyPathTemplate(rootService.pathParameters, rootService.basePath),
                  generatedClasses,
                  flattenedProperties,
                  fileUploadUtility
              )
            : [],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            functionBody: [
                new Expression({
                    leftSide: asyncRequestClientVariable,
                    rightSide: new FunctionInvocation({
                        onObject: asyncRequestClient.classReference,
                        baseFunction: asyncRequestClient.initializer,
                        arguments_: asyncRequestClient.properties.map((prop) => prop.toArgument(prop.name, true))
                    }),
                    isAssignment: true
                }),
                ...asyncSubpackages.map((sp) => {
                    const spInstanceVar = new Variable({
                        name: snakeCase(sp.classReference.name),
                        type: sp.classReference,
                        variableType: VariableType.INSTANCE
                    });
                    return new Expression({
                        leftSide: spInstanceVar,
                        rightSide: new FunctionInvocation({
                            onObject: sp.classReference,
                            baseFunction: sp.initializer,
                            arguments_: sp.properties.map((prop) => prop.toArgument(requestClientVariable, true))
                        }),
                        isAssignment: true
                    });
                })
            ],
            parameters: asyncRequestClient.initializer?.parameters
        })
    });

    const allTypeImports = Array.from(crf.generatedReferences.entries())
        .map(([_, cr]) => cr.import_)
        .filter((i) => i !== undefined) as Import[];
    const rootNode = Module_.wrapInModules(
        clientName,
        [clientClass, asyncClientClass],
        undefined,
        true,
        allTypeImports
    );
    return new GeneratedRubyFile({
        rootNode,
        directoryPrefix: RelativeFilePath.of("."),
        nestImportsInDirectory: RelativeFilePath.of(gemName),
        name: `${gemName}`
    });
}

export function generateSubpackage(
    package_: Package,
    requestClientCr: ClassReference,
    asyncRequestClientCr: ClassReference,
    subpackages: Class_[] = [],
    asyncSubpackages: Class_[] = []
): ClientClassPair {
    const location = getLocationFromFernFilepath(package_.fernFilepath) + "client";

    // Add Client class
    const requestClientProperty = new Property({ name: "request_client", type: requestClientCr });
    const syncClientClass = new Class_({
        classReference: new ClassReference({
            name: "Client",
            import_: new Import({ from: location, isExternal: false })
        }),
        properties: [requestClientProperty],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            // Initialize each subpackage
            functionBody: subpackages.map((sp) => {
                const subpackageClassVariable = new Variable({
                    name: snakeCase(sp.classReference.name),
                    type: sp.classReference,
                    variableType: VariableType.INSTANCE
                });
                return new Expression({
                    leftSide: subpackageClassVariable,
                    rightSide:
                        sp.initializer !== undefined
                            ? new FunctionInvocation({
                                  onObject: sp.classReference,
                                  baseFunction: sp.initializer,
                                  arguments_: sp.properties.map((prop) =>
                                      prop.toArgument(requestClientProperty.toVariable(), true)
                                  )
                              })
                            : sp.classReference,
                    isAssignment: true
                });
            }),
            parameters: [new Parameter({ name: "client", type: requestClientCr })]
        })
    });

    // Add Async Client class
    const asyncRequestClientProperty = new Property({ name: "request_client", type: asyncRequestClientCr });
    const asyncClientClass = new Class_({
        classReference: new ClassReference({
            name: "AsyncClient",
            import_: new Import({ from: location, isExternal: false })
        }),
        properties: [new Property({ name: "client", type: asyncRequestClientCr })],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            // Initialize each subpackage
            functionBody: asyncSubpackages.map((sp) => {
                const subpackageClassVariable = new Variable({
                    name: snakeCase(sp.classReference.name),
                    type: sp.classReference,
                    variableType: VariableType.INSTANCE
                });
                return new Expression({
                    leftSide: subpackageClassVariable,
                    rightSide:
                        sp.initializer !== undefined
                            ? new FunctionInvocation({
                                  onObject: sp.classReference,
                                  baseFunction: sp.initializer,
                                  arguments_: sp.properties.map((prop) =>
                                      prop.toArgument(asyncRequestClientProperty.toVariable(), true)
                                  )
                              })
                            : sp.classReference,
                    isAssignment: true
                });
            }),
            parameters: [new Parameter({ name: "client", type: asyncRequestClientCr })]
        })
    });

    return { syncClientClass, asyncClientClass };
}

export function generateService(
    service: HttpService,
    requestClientCr: ClassReference,
    asyncRequestClientCr: ClassReference,
    crf: ClassReferenceFactory,
    requestOptions: RequestOptions,
    irBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility
): ClientClassPair {
    const serviceName = service.name.fernFilepath.file?.pascalCase.safeName ?? "";
    const import_ = new Import({ from: getLocationForServiceDeclaration(service.name), isExternal: false });

    // Add Client class
    const serviceBasePath = generateRubyPathTemplate(service.pathParameters, service.basePath);
    const requestClientProperty = new Property({ name: "request_client", type: requestClientCr });
    const syncClientClass = new Class_({
        classReference: new ClassReference({
            name: `${serviceName}Client`,
            import_
        }),
        properties: [requestClientProperty],
        includeInitializer: true,
        functions: generateEndpoints(
            crf,
            requestClientProperty.toVariable(),
            service.endpoints,
            requestOptions,
            false,
            irBasePath,
            serviceBasePath,
            generatedClasses,
            flattenedProperties,
            fileUploadUtility
        )
    });

    // Add Async Client class
    const asyncRequestClientProperty = new Property({ name: "request_client", type: asyncRequestClientCr });
    const asyncClientClass = new Class_({
        classReference: new ClassReference({
            name: `Async${serviceName}Client`,
            import_
        }),
        properties: [asyncRequestClientProperty],
        includeInitializer: true,
        functions: generateEndpoints(
            crf,
            asyncRequestClientProperty.toVariable(),
            service.endpoints,
            requestOptions,
            true,
            irBasePath,
            serviceBasePath,
            generatedClasses,
            flattenedProperties,
            fileUploadUtility
        )
    });

    return { syncClientClass, asyncClientClass };
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

export function getDefaultEnvironmentUrl(environmentsConfig?: EnvironmentsConfig): string | undefined {
    if (environmentsConfig !== undefined && environmentsConfig.defaultEnvironment !== undefined) {
        return `Environment::${
            getEnvironments(environmentsConfig).get(environmentsConfig.defaultEnvironment)?.screamingSnakeCase.safeName
        }`;
    }
    return;
}

// Actually might just be: be able to reference the default + create the files, it looks like endpoints
export function generateEnvironmentConstants(environmentsConfig: EnvironmentsConfig): Class_ {
    return new Class_({
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
}

function generateRequestClientInitializer(
    isAsync: boolean,
    sdkConfig: SdkConfig,
    classReference: ClassReference,
    clientName: string,
    sdkVersion: string | undefined,
    headersGenerator: HeadersGenerator,
    environmentCr: ClassReference | undefined,
    isMultiBaseUrlEnvironments: boolean,
    defaultEnvironment?: string,
    hasFileBasedDependencies = false
): Function_ {
    const allHeaders = new Map([
        // SDK Default Headers
        [`"${sdkConfig.platformHeaders.language}"`, "Ruby"],
        [`"${sdkConfig.platformHeaders.sdkName}"`, clientName],
        // Auth Default Headers
        ...headersGenerator.getAuthHeaders()
    ]);
    if (sdkVersion !== undefined) {
        allHeaders.set(sdkConfig.platformHeaders.sdkVersion, sdkVersion);
    }

    // If "all" then require the param and always put it in, if optional
    // just add the header if it's there headers["name"] = value if value
    let authHeaders = new Map();
    const authHeaderSetters: Expression[] = [];

    const authHeaderProperties = headersGenerator.getAuthHeadersAsProperties();

    if (headersGenerator.isAuthRequired) {
        authHeaders = new Map(headersGenerator.getAuthHeaders());
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
        // TODO: parse and throw the custom exception within the endpoint function. Disable this faraday middleware that does this generically.
        new Expression({
            leftSide: "faraday.response",
            rightSide: ":raise_error, include_request: true",
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

    if (hasFileBasedDependencies) {
        faradayConfiguration.push(
            new Expression({
                leftSide: "faraday.request",
                rightSide: new Expression({
                    rightSide: new ClassReference({
                        name: ":multipart",
                        import_: new Import({ from: "faraday/multipart", isExternal: true })
                    })
                }),
                isAssignment: false
            })
        );
    }

    const functionParams = [];
    const functionBody = [];
    const faradayArgs = [];

    if (environmentCr !== undefined) {
        functionBody.push(
            new Expression({
                leftSide: "@default_environment",
                rightSide: "environment",
                isAssignment: true
            })
        );
        // We have a single URL if it's not multi-base, so we can set a default
        if (!isMultiBaseUrlEnvironments) {
            functionBody.push(
                new Expression({
                    leftSide: "@base_url",
                    rightSide: "environment",
                    isAssignment: true
                })
            );
            faradayArgs.push(new Argument({ isNamed: false, type: StringClassReference, value: "@base_url" }));
        }
        functionParams.push(
            new Parameter({
                name: "environment",
                type: environmentCr,
                defaultValue: defaultEnvironment,
                isOptional: true
            })
        );
    }

    return new Function_({
        name: "initialize",
        parameters: [
            ...functionParams,
            // Select sample of the request overrides object properties
            new Parameter({
                name: "max_retries",
                type: LongClassReference,
                isOptional: true,
                documentation: "The number of times to retry a failed request, defaults to 2."
            }),
            new Parameter({ name: "timeout_in_seconds", type: LongClassReference, isOptional: true }),
            // Auth headers
            ...headersGenerator.getAuthHeadersAsParameters(),
            // Global headers
            ...headersGenerator.getAdditionalHeadersAsParameters()
        ],
        returnValue: classReference,
        functionBody: [
            ...functionBody,
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
                        ...faradayArgs,
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
    sdkConfig: SdkConfig,
    clientName: string,
    sdkVersion: string | undefined,
    headersGenerator: HeadersGenerator,
    environmentCr: ClassReference | undefined,
    isMultiBaseUrlEnvironments: boolean,
    defaultEnvironment: string | undefined,
    hasFileBasedDependencies: boolean | undefined
): [Class_, Class_] {
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
        properties: clientProperties,
        includeInitializer: false,
        initializerOverride: generateRequestClientInitializer(
            false,
            sdkConfig,
            clientClassReference,
            clientName,
            sdkVersion,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            defaultEnvironment,
            hasFileBasedDependencies
        )
    });

    // Add Async Client class
    const asyncClientClassReference = new ClassReference({ name: "AsyncRequestClient", location: "requests" });
    const asyncClientClass = new Class_({
        classReference: asyncClientClassReference,
        properties: clientProperties,
        includeInitializer: false,
        initializerOverride: generateRequestClientInitializer(
            true,
            sdkConfig,
            asyncClientClassReference,
            clientName,
            sdkVersion,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            defaultEnvironment,
            hasFileBasedDependencies
        )
    });

    return [clientClass, asyncClientClass];
}
