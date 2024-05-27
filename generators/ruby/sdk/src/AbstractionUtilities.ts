import { generatePathTemplate } from "@fern-api/generator-commons";
import {
    Argument,
    AstNode,
    ClassReference,
    ClassReferenceFactory,
    Class_,
    ConditionalStatement,
    ExampleGenerator,
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
    Subpackage,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { EndpointGenerator } from "./utils/EndpointGenerator";
import { FileUploadUtility } from "./utils/FileUploadUtility";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { IdempotencyRequestOptions } from "./utils/IdempotencyRequestOptionsClass";
import { RequestOptions } from "./utils/RequestOptionsClass";

export interface ClientClassPair {
    subpackageName: Name;
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
    eg: ExampleGenerator,
    requestClientVariable: Variable,
    endpoints: HttpEndpoint[],
    requestOptions: RequestOptions,
    idempotencyRequestOptions: IdempotencyRequestOptions,
    isAsync: boolean,
    irBasePath: string,
    serviceBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility,
    packagePath: string[]
): Function_[] {
    return endpoints
        .map((endpoint) => {
            if (EndpointGenerator.isStreamingResponse(endpoint)) {
                return;
            }
            const path = [irBasePath, serviceBasePath, generateRubyPathTemplate(endpoint.pathParameters, endpoint.path)]
                .filter((pathPart) => pathPart !== "")
                .join("/");
            const responseVariable = new Variable({
                name: "response",
                type: GenericClassReference,
                variableType: VariableType.LOCAL
            });

            const endpointRequestOptions = endpoint.idempotent ? idempotencyRequestOptions : requestOptions;
            const requestOptionsVariable = new Variable({
                name: "request_options",
                type: endpointRequestOptions.classReference,
                variableType: VariableType.LOCAL
            });
            const generator = new EndpointGenerator(
                endpoint,
                requestOptionsVariable,
                endpointRequestOptions,
                crf,
                eg,
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
                        block: generator.getFaradayBlock(requestClientVariable, path, shouldOverwriteUrl)
                    }),
                    isAssignment: true
                }),
                // TODO: parse and throw the custom exception here. Disable the faraday middleware that does this generically.
                ...(generator.getResponseExpressions(responseVariable) ?? [])
            ];

            const func = new Function_({
                name: endpoint.name.snakeCase.safeName,
                parameters: generator.getEndpointParameters(),
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
                eg,
                flattenedProperties,
                documentation: endpoint.docs,
                packagePath,
                skipExample: !generator.endpointHasExamples
            });

            if (generator.endpointHasExamples) {
                eg.registerSnippet(func, endpoint);
            }

            return func;
        })
        .filter((fun) => fun !== undefined) as Function_[];
}

// HACK: we generate the root package at the end to have all the subpackages generated, but we also need to know
// how to instantiate the root client to be able to generate the snippets as we go.
export function generateDummyRootClient(gemName: string, clientName: string, requestClient: Class_): Class_ {
    const classReference = new ClassReference({
        name: "Client",
        import_: new Import({ from: gemName, isExternal: false }),
        moduleBreadcrumbs: [clientName]
    });

    return new Class_({
        classReference,
        properties: [],
        functions: [],
        includeInitializer: false,
        initializerOverride: requestClient.initializer
    });
}

export function generateRootPackage(
    gemName: string,
    clientName: string,
    requestClient: Class_,
    asyncRequestClient: Class_,
    requestOptions: RequestOptions,
    idempotencyRequestOptions: IdempotencyRequestOptions,
    crf: ClassReferenceFactory,
    eg: ExampleGenerator,
    syncSubpackages: Map<Name, Class_>,
    asyncSubpackages: Map<Name, Class_>,
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
        import_: new Import({ from: gemName, isExternal: false }),
        moduleBreadcrumbs: [clientName]
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
            ([spName, sp]) => new Property({ name: getSubpackagePropertyNameFromIr(spName), type: sp.classReference })
        ),
        functions: rootService
            ? generateEndpoints(
                  crf,
                  eg,
                  requestClientVariable,
                  rootService.endpoints,
                  requestOptions,
                  idempotencyRequestOptions,
                  false,
                  irBasePath,
                  generateRubyPathTemplate(rootService.pathParameters, rootService.basePath),
                  generatedClasses,
                  flattenedProperties,
                  fileUploadUtility,
                  []
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
                        name: getSubpackagePropertyNameFromIr(spName),
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
        import_: new Import({ from: gemName, isExternal: false }),
        moduleBreadcrumbs: [clientName]
    });
    const asyncClientClass = new Class_({
        classReference: asyncClassReference,
        properties: Array.from(asyncSubpackages.entries()).map(
            ([spName, sp]) => new Property({ name: getSubpackagePropertyNameFromIr(spName), type: sp.classReference })
        ),
        functions: rootService
            ? generateEndpoints(
                  crf,
                  eg,
                  asyncRequestClientVariable,
                  rootService.endpoints,
                  requestOptions,
                  idempotencyRequestOptions,
                  false,
                  irBasePath,
                  generateRubyPathTemplate(rootService.pathParameters, rootService.basePath),
                  generatedClasses,
                  flattenedProperties,
                  fileUploadUtility,
                  []
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
                        name: getSubpackagePropertyNameFromIr(spName),
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
        maybeEnvironmentImport !== undefined ? [maybeEnvironmentImport, typeExporterImport] : [typeExporterImport],
        true
    );
    return new GeneratedRubyFile({
        rootNode,
        fullPath: gemName
    });
}

export function generateSubpackage(
    clientName: string,
    subpackageName: Name,
    package_: Package,
    requestClientCr: ClassReference,
    asyncRequestClientCr: ClassReference,
    locationGenerator: LocationGenerator,
    subpackages: Map<Name, Class_> = new Map(),
    asyncSubpackages: Map<Name, Class_> = new Map()
): ClientClassPair {
    const location = locationGenerator.getLocationFromFernFilepath(package_.fernFilepath, "client");
    const moduleBreadcrumbs = getBreadcrumbsFromFilepath(package_.fernFilepath, clientName);

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
        properties: Array.from(subpackages.entries()).map(
            ([spName, sp]) => new Property({ name: getSubpackagePropertyNameFromIr(spName), type: sp.classReference })
        ),
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            // Initialize each subpackage
            functionBody: Array.from(subpackages.entries()).map(([spName, sp]) => {
                const subpackageClassVariable = new Variable({
                    name: getSubpackagePropertyNameFromIr(spName),
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
                                  arguments_: sp.initializer.parameters.map((param) =>
                                      param.toArgument(requestClientProperty.toVariable(VariableType.LOCAL))
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
        properties: Array.from(asyncSubpackages.entries()).map(
            ([spName, sp]) => new Property({ name: getSubpackagePropertyNameFromIr(spName), type: sp.classReference })
        ),
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            // Initialize each subpackage
            functionBody: Array.from(asyncSubpackages.entries()).map(([spName, sp]) => {
                const subpackageClassVariable = new Variable({
                    name: getSubpackagePropertyNameFromIr(spName),
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
                                  arguments_: sp.initializer.parameters.map((param) =>
                                      param.toArgument(asyncRequestClientProperty.toVariable(VariableType.LOCAL))
                                  )
                              })
                            : sp.classReference,
                    isAssignment: true
                });
            }),
            parameters: [asyncRequestClientProperty.toParameter({})],
            returnValue: asyncClassReference
        })
    });
    return { subpackageName, syncClientClass, asyncClientClass };
}

export function generateService(
    clientName: string,
    service: HttpService,
    subpackage: Subpackage,
    requestClientCr: ClassReference,
    asyncRequestClientCr: ClassReference,
    crf: ClassReferenceFactory,
    eg: ExampleGenerator,
    requestOptions: RequestOptions,
    idempotencyRequestOptions: IdempotencyRequestOptions,
    irBasePath: string,
    generatedClasses: Map<TypeId, Class_>,
    flattenedProperties: Map<TypeId, ObjectProperty[]>,
    fileUploadUtility: FileUploadUtility,
    locationGenerator: LocationGenerator,
    packagePath: string[]
): ClientClassPair {
    const subpackageName = subpackage.name;
    const serviceName = subpackageName.pascalCase.safeName;
    const import_ = new Import({
        from: locationGenerator.getLocationForServiceDeclaration(service.name),
        isExternal: false
    });
    const moduleBreadcrumbs = getBreadcrumbsFromFilepath(service.name.fernFilepath, clientName);

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
            eg,
            requestClientProperty.toVariable(),
            service.endpoints,
            requestOptions,
            idempotencyRequestOptions,
            false,
            irBasePath,
            serviceBasePath,
            generatedClasses,
            flattenedProperties,
            fileUploadUtility,
            packagePath
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
            eg,
            asyncRequestClientProperty.toVariable(),
            service.endpoints,
            requestOptions,
            idempotencyRequestOptions,
            true,
            irBasePath,
            serviceBasePath,
            generatedClasses,
            flattenedProperties,
            fileUploadUtility,
            packagePath
        )
    });

    return { subpackageName, syncClientClass, asyncClientClass };
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

export function getDefaultEnvironmentUrl(
    clientName: string,
    environmentsConfig?: EnvironmentsConfig
): string | undefined {
    if (environmentsConfig !== undefined && environmentsConfig.defaultEnvironment !== undefined) {
        return `${clientName}::Environment::${
            getEnvironments(environmentsConfig).get(environmentsConfig.defaultEnvironment)?.screamingSnakeCase.safeName
        }`;
    }
    return;
}

// Actually might just be: be able to reference the default + create the files, it looks like endpoints
export function generateEnvironmentConstants(environmentsConfig: EnvironmentsConfig, clientName: string): Class_ {
    return new Class_({
        classReference: new ClassReference({
            name: "Environment",
            import_: new Import({ from: "environment", isExternal: false }),
            moduleBreadcrumbs: [clientName]
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
    gemName: string,
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
        [`"${sdkConfig.platformHeaders.sdkName}"`, gemName]
    ]);
    if (sdkVersion !== undefined) {
        allHeaders.set(`"${sdkConfig.platformHeaders.sdkVersion}"`, sdkVersion);
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
                    }),
                    isAssignment: false
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
                            operation: ", ",
                            isAssignment: false
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

    if (environmentCr !== undefined) {
        functionParams.push(
            new Parameter({
                name: "environment",
                type: environmentCr,
                defaultValue: defaultEnvironment,
                isOptional: true,
                example: defaultEnvironment
            })
        );
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
                    rightSide: "environment || base_url",
                    isAssignment: true
                })
            );
        }
    } else {
        functionBody.push(
            new Expression({
                leftSide: "@base_url",
                rightSide: "base_url",
                isAssignment: true
            })
        );
    }

    functionParams.push(
        new Parameter({
            name: "base_url",
            type: StringClassReference,
            isOptional: true,
            example: '"https://api.example.com"'
        })
    );

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
                        new Argument({
                            isNamed: true,
                            name: "headers",
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

function requestClientFunctions(
    requestOptions: RequestOptions,
    baseUrlProperty: Property,
    environmentProperty: Property | undefined,
    isMultiBaseUrlEnvironments: boolean
): Function_[] {
    const requestOptionsParameter = new Parameter({
        name: "request_options",
        type: requestOptions.classReference,
        isOptional: true
    });
    const environmentOverrideParameter = new Parameter({
        name: "environment",
        type: StringClassReference
    });
    const parameters = [requestOptionsParameter];
    if (environmentProperty != null && isMultiBaseUrlEnvironments) {
        parameters.push(environmentOverrideParameter);
    }

    return [
        new Function_({
            name: "get_url",
            functionBody: [
                new Expression({
                    leftSide: requestOptions.getBaseUrlProperty(requestOptionsParameter.toVariable()),
                    rightSide:
                        environmentProperty != null
                            ? new Expression({
                                  rightSide: baseUrlProperty.toVariable(),
                                  leftSide: isMultiBaseUrlEnvironments
                                      ? `${environmentProperty.toVariable().write({})}[${environmentOverrideParameter
                                            .toVariable()
                                            .write({})}]`
                                      : environmentProperty.toVariable(),
                                  operation: "||",
                                  isAssignment: false
                              })
                            : baseUrlProperty.toVariable(),
                    operation: "||",
                    isAssignment: false
                })
            ],
            parameters,
            returnValue: StringClassReference
        })
    ];
}

export function generateRequestClients(
    clientName: string,
    sdkConfig: SdkConfig,
    gemName: string,
    sdkVersion: string | undefined,
    headersGenerator: HeadersGenerator,
    environmentCr: ClassReference | undefined,
    isMultiBaseUrlEnvironments: boolean,
    defaultEnvironment: string | undefined,
    hasFileBasedDependencies: boolean | undefined,
    requestOptions: RequestOptions
): [Class_, Class_] {
    const hasEnvironments = environmentCr != null;
    const faradayReference = new ClassReference({
        name: "Faraday",
        import_: new Import({ from: "faraday", isExternal: true })
    });
    const baseUrlProperty = new Property({
        name: "base_url",
        type: StringClassReference
    });
    const environmentProperty = new Property({
        name: "default_environment",
        type: StringClassReference
    });
    // Client properties
    const clientProperties = [
        new Property({
            name: "headers",
            type: new HashReference({ keyType: StringClassReference, valueType: StringClassReference })
        }),
        new Property({ name: "conn", type: faradayReference }),
        baseUrlProperty
    ];

    if (hasEnvironments) {
        clientProperties.push(environmentProperty);
    }

    // Add Client class
    const clientClassReference = new ClassReference({
        name: "RequestClient",
        import_: new Import({ from: "requests", isExternal: false }),
        moduleBreadcrumbs: [clientName]
    });
    const clientClass = new Class_({
        classReference: clientClassReference,
        properties: clientProperties,
        includeInitializer: false,
        initializerOverride: generateRequestClientInitializer(
            false,
            sdkConfig,
            clientClassReference,
            gemName,
            sdkVersion,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            defaultEnvironment,
            hasFileBasedDependencies
        ),
        functions: requestClientFunctions(
            requestOptions,
            baseUrlProperty,
            environmentCr != null ? environmentProperty : undefined,
            isMultiBaseUrlEnvironments
        )
    });

    // Add Async Client class
    const asyncClientClassReference = new ClassReference({
        name: "AsyncRequestClient",
        import_: new Import({ from: "requests", isExternal: false }),
        moduleBreadcrumbs: [clientName]
    });
    const asyncClientClass = new Class_({
        classReference: asyncClientClassReference,
        properties: clientProperties,
        includeInitializer: false,
        initializerOverride: generateRequestClientInitializer(
            true,
            sdkConfig,
            asyncClientClassReference,
            gemName,
            sdkVersion,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            defaultEnvironment,
            hasFileBasedDependencies
        ),
        functions: requestClientFunctions(
            requestOptions,
            baseUrlProperty,
            environmentCr != null ? environmentProperty : undefined,
            isMultiBaseUrlEnvironments
        )
    });

    return [clientClass, asyncClientClass];
}

export function getSubpackagePropertyNameFromIr(name: Name): string {
    return name.snakeCase.safeName;
}
