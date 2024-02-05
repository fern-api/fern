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
    getBreadcrumbsFromFilepath,
    HashInstance,
    HashReference,
    Import,
    LocationGenerator,
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
    subpackageName: string;
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
    return endpoints
        .map((endpoint) => {
            if (EndpointGenerator.isStreamingResponse(endpoint)) {
                return;
            }
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

            const shouldOverwriteUrl = endpoint.baseUrl !== undefined;
            const functionCore: AstNode[] = [
                new Expression({
                    leftSide: responseVariable,
                    rightSide: new FunctionInvocation({
                        // TODO: Do this field access on the client better
                        onObject: `${requestClientVariable.write({})}.conn`,
                        baseFunction: new Function_({ name: endpoint.method.toLowerCase(), functionBody: [] }),
                        arguments_: shouldOverwriteUrl
                            ? []
                            : [new Argument({ isNamed: false, value: `"/${path}"`, type: StringClassReference })],
                        block: generator.getFaradayBlock(requestClientVariable, path, shouldOverwriteUrl)
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
                flattenedProperties,
                documentation: endpoint.docs
            });
        })
        .filter((fun) => fun !== undefined) as Function_[];
}

export function generateRootPackage(
    gemName: string,
    clientName: string,
    requestClient: Class_,
    asyncRequestClient: Class_,
    requestOptions: RequestOptions,
    crf: ClassReferenceFactory,
    syncSubpackages: Map<string, Class_>,
    asyncSubpackages: Map<string, Class_>,
    irBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility,
    typeExporterLocation: string,
    environmentClass?: ClassReference,
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
        variableType: VariableType.INSTANCE
    });
    const clientClass = new Class_({
        classReference,
        properties: Array.from(syncSubpackages.entries()).map(
            ([spName, sp]) => new Property({ name: snakeCase(spName), type: sp.classReference })
        ),
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
            invocationName: "new",
            functionBody: [
                new Expression({
                    leftSide: requestClientVariable,
                    rightSide: new FunctionInvocation({
                        onObject: requestClient.classReference,
                        baseFunction: requestClient.initializer,
                        arguments_: requestClient.initializer?.parameters.map((param) => param.toArgument(param.name))
                    }),
                    isAssignment: true
                }),
                ...Array.from(syncSubpackages.entries()).map(([spName, sp]) => {
                    const spInstanceVar = new Variable({
                        name: snakeCase(spName),
                        type: sp.classReference,
                        variableType: VariableType.INSTANCE
                    });
                    return new Expression({
                        leftSide: spInstanceVar,
                        rightSide: new FunctionInvocation({
                            onObject: sp.classReference,
                            baseFunction: sp.initializer,
                            arguments_: sp.initializer?.parameters.map((param) =>
                                param.toArgument(requestClientVariable)
                            )
                        }),
                        isAssignment: true
                    });
                })
            ],
            parameters: requestClient.initializer?.parameters,
            returnValue: classReference
        })
    });

    // Add Async Client class
    const asyncRequestClientVariable = new Variable({
        name: "async_request_client",
        type: asyncRequestClient.classReference,
        variableType: VariableType.INSTANCE
    });
    const asyncClassReference = new ClassReference({
        name: "AsyncClient",
        import_: new Import({ from: gemName, isExternal: false })
    });
    const asyncClientClass = new Class_({
        classReference: asyncClassReference,
        properties: Array.from(asyncSubpackages.entries()).map(
            ([spName, sp]) => new Property({ name: snakeCase(spName), type: sp.classReference })
        ),
        functions: rootService
            ? generateEndpoints(
                  crf,
                  asyncRequestClientVariable,
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
            invocationName: "new",
            functionBody: [
                new Expression({
                    leftSide: asyncRequestClientVariable,
                    rightSide: new FunctionInvocation({
                        onObject: asyncRequestClient.classReference,
                        baseFunction: asyncRequestClient.initializer,
                        arguments_: asyncRequestClient.initializer?.parameters.map((param) =>
                            param.toArgument(param.name)
                        )
                    }),
                    isAssignment: true
                }),
                ...Array.from(asyncSubpackages.entries()).map(([spName, sp]) => {
                    const spInstanceVar = new Variable({
                        name: snakeCase(spName),
                        type: sp.classReference,
                        variableType: VariableType.INSTANCE
                    });
                    return new Expression({
                        leftSide: spInstanceVar,
                        rightSide: new FunctionInvocation({
                            onObject: sp.classReference,
                            baseFunction: sp.initializer,
                            arguments_: sp.initializer?.parameters.map((param) =>
                                param.toArgument(asyncRequestClientVariable)
                            )
                        }),
                        isAssignment: true
                    });
                })
            ],
            parameters: asyncRequestClient.initializer?.parameters,
            returnValue: asyncClassReference
        })
    });

    const maybeEnvironmentImport = environmentClass?.import_;
    const typeExporterImport = new Import({ from: typeExporterLocation, isExternal: false });
    const rootNode = Module_.wrapInModules(
        clientName,
        [clientClass, asyncClientClass],
        undefined,
        true,
        maybeEnvironmentImport !== undefined ? [maybeEnvironmentImport, typeExporterImport] : [typeExporterImport]
    );
    return new GeneratedRubyFile({
        rootNode,
        fullPath: `${gemName}`
    });
}

export function generateSubpackage(
    subpackageName: Name,
    package_: Package,
    requestClientCr: ClassReference,
    asyncRequestClientCr: ClassReference,
    locationGenerator: LocationGenerator,
    subpackages: Map<string, Class_> = new Map(),
    asyncSubpackages: Map<string, Class_> = new Map()
): ClientClassPair {
    const location = locationGenerator.getLocationFromFernFilepath(package_.fernFilepath, "client");
    const moduleBreadcrumbs = getBreadcrumbsFromFilepath(package_.fernFilepath);

    // Add Client class
    const requestClientProperty = new Property({ name: "request_client", type: requestClientCr });
    const syncClassReference = new ClassReference({
        name: "Client",
        import_: new Import({ from: location, isExternal: false }),
        moduleBreadcrumbs
    });
    const syncClientClass = new Class_({
        classReference: syncClassReference,
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            // Initialize each subpackage
            functionBody: Array.from(subpackages.entries()).map(([spName, sp]) => {
                const subpackageClassVariable = new Variable({
                    name: snakeCase(spName),
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
                                      prop.toArgument(requestClientProperty.toVariable(VariableType.LOCAL), true)
                                  )
                              })
                            : sp.classReference,
                    isAssignment: true
                });
            }),
            parameters: [requestClientProperty.toParameter({})],
            returnValue: syncClassReference,
            documentation: package_.docs
        })
    });

    // Add Async Client class
    const asyncRequestClientProperty = new Property({ name: "request_client", type: asyncRequestClientCr });
    const asyncClassReference = new ClassReference({
        name: "AsyncClient",
        import_: new Import({ from: location, isExternal: false }),
        moduleBreadcrumbs
    });
    const asyncClientClass = new Class_({
        classReference: asyncClassReference,
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            // Initialize each subpackage
            functionBody: Array.from(asyncSubpackages.entries()).map(([spName, sp]) => {
                const subpackageClassVariable = new Variable({
                    name: snakeCase(spName),
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
                                      prop.toArgument(asyncRequestClientProperty.toVariable(VariableType.LOCAL), true)
                                  )
                              })
                            : sp.classReference,
                    isAssignment: true
                });
            }),
            parameters: [requestClientProperty.toParameter({})],
            returnValue: asyncClassReference
        })
    });

    return { subpackageName: subpackageName.pascalCase.safeName, syncClientClass, asyncClientClass };
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
    fileUploadUtility: FileUploadUtility,
    locationGenerator: LocationGenerator
): ClientClassPair {
    const serviceName = service.name.fernFilepath.file?.pascalCase.safeName ?? "";
    const import_ = new Import({
        from: locationGenerator.getLocationForServiceDeclaration(service.name),
        isExternal: false
    });
    const moduleBreadcrumbs = getBreadcrumbsFromFilepath(service.name.fernFilepath);

    // Add Client class
    const serviceBasePath = generateRubyPathTemplate(service.pathParameters, service.basePath);
    const requestClientProperty = new Property({ name: "request_client", type: requestClientCr });
    const syncClientClass = new Class_({
        classReference: new ClassReference({
            name: `${serviceName}Client`,
            import_,
            moduleBreadcrumbs
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
            import_,
            moduleBreadcrumbs
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

    return { subpackageName: serviceName, syncClientClass, asyncClientClass };
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
        classReference: new ClassReference({
            name: "Environment",
            import_: new Import({ from: "environment", isExternal: false })
        }),
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
        [`"${sdkConfig.platformHeaders.sdkName}"`, clientName]
    ]);
    if (sdkVersion !== undefined) {
        allHeaders.set(sdkConfig.platformHeaders.sdkVersion, sdkVersion);
    }

    // If "all" then require the param and always put it in, if optional
    // just add the header if it's there headers["name"] = value if value
    let authHeaders = new Map();
    const authHeaderSetters: AstNode[] = [];
    let headersToSet = headersGenerator.getAdditionalHeadersAsProperties();
    if (headersGenerator.isAuthRequired) {
        authHeaders = new Map(headersGenerator.getAuthHeaders());
    } else {
        headersToSet = [...headersGenerator.getAuthHeadersAsProperties(), ...headersToSet];
    }
    // Make an if statement for each auth scheme that adds the header if present
    headersToSet.forEach((prop) =>
        authHeaderSetters.push(
            new ConditionalStatement({
                if_: {
                    rightSide: new FunctionInvocation({
                        onObject: prop.name,
                        baseFunction: new Function_({ name: "nil?", functionBody: [] })
                    }),
                    operation: "!",
                    expressions: [
                        new Expression({
                            leftSide: `@headers["${prop.wireValue ?? prop.name}"]`,
                            rightSide: prop.name,
                            isAssignment: true
                        })
                    ]
                }
            })
        )
    );

    const retriesProperty = new Property({
        name: "max_retries",
        type: LongClassReference,
        isOptional: true,
        documentation: "The number of times to retry a failed request, defaults to 2."
    });
    const timeoutProperty = new Property({ name: "timeout_in_seconds", type: LongClassReference, isOptional: true });

    const retryOptions = new HashInstance({
        contents: new Map([["max", retriesProperty.toVariable(VariableType.LOCAL)]])
    });
    const faradayConfiguration = [];
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
    faradayConfiguration.push(
        ...[
            new Expression({ leftSide: "faraday.request", rightSide: ":json", isAssignment: false }),
            // TODO: parse and throw the custom exception within the endpoint function. Disable this faraday middleware that does this generically.
            new Expression({
                leftSide: "faraday.response",
                rightSide: ":raise_error, include_request: true",
                isAssignment: false
            })
        ]
    );

    if (isAsync) {
        faradayConfiguration.push(
            new Expression({
                leftSide: "faraday.adapter",
                rightSide: new ClassReference({
                    name: ":async_http",
                    import_: new Import({ from: "async/http/faraday", isExternal: true })
                }),
                isAssignment: false
            })
        );
    }

    const initialRequestOverrides: Property[] = [retriesProperty, timeoutProperty];
    faradayConfiguration.push(
        new ConditionalStatement({
            if_: {
                rightSide: new FunctionInvocation({
                    // TODO: Do this field access on the client better
                    onObject: retriesProperty.toVariable(VariableType.LOCAL).write({}),
                    baseFunction: new Function_({ name: "nil?", functionBody: [] })
                }),
                operation: "!",
                expressions: [
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
                    })
                ]
            }
        })
    );
    faradayConfiguration.push(
        new ConditionalStatement({
            if_: {
                rightSide: new FunctionInvocation({
                    // TODO: Do this field access on the client better
                    onObject: timeoutProperty.toVariable(VariableType.LOCAL).write({}),
                    baseFunction: new Function_({ name: "nil?", functionBody: [] })
                }),
                operation: "!",
                expressions: [
                    new Expression({
                        leftSide: "faraday.options.timeout",
                        rightSide: timeoutProperty.toVariable(VariableType.LOCAL).write({}),
                        isAssignment: true
                    })
                ]
            }
        })
    );

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
        invocationName: "new",
        parameters: [
            ...functionParams,
            // Select sample of the request overrides object properties
            ...initialRequestOverrides.map((prop) => prop.toParameter({})),
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
        new Property({
            name: isMultiBaseUrlEnvironments ? "default_environment" : "base_url",
            type: StringClassReference
        }),
        new Property({ name: "conn", type: faradayReference })
    ];
    // Add Client class
    const clientClassReference = new ClassReference({
        name: "RequestClient",
        import_: new Import({ from: "requests", isExternal: false })
    });
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
    const asyncClientClassReference = new ClassReference({
        name: "AsyncRequestClient",
        import_: new Import({ from: "requests", isExternal: false })
    });
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
