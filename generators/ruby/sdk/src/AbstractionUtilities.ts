import { format } from "util";

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
    HashInstance,
    HashReference,
    Import,
    LocationGenerator,
    Module_,
    Parameter,
    Property,
    StringClassReference,
    Variable,
    VariableType,
    getBreadcrumbsFromFilepath
} from "@fern-api/ruby-codegen";

import {
    EnvironmentId,
    EnvironmentsConfig,
    HttpEndpoint,
    HttpPath,
    HttpService,
    MultipleBaseUrlsEnvironments,
    Name,
    OAuthRefreshEndpoint,
    OAuthTokenEndpoint,
    ObjectProperty,
    Package,
    PathParameter,
    PlatformHeaders,
    SdkConfig,
    SingleBaseUrlEnvironments,
    Subpackage,
    TypeId
} from "@fern-fern/ir-sdk/api";

import { ArtifactRegistry } from "./utils/ArtifactRegistry";
import { EndpointGenerator } from "./utils/EndpointGenerator";
import { FileUploadUtility } from "./utils/FileUploadUtility";
import { HeadersGenerator } from "./utils/HeadersGenerator";
import { IdempotencyRequestOptions } from "./utils/IdempotencyRequestOptionsClass";
import { RequestOptions } from "./utils/RequestOptionsClass";
import { OauthFunction, OauthTokenProvider } from "./utils/oauth/OauthTokenProvider";

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
    packagePath: string[],
    packageClassReference: ClassReference | undefined,
    artifactRegistry: ArtifactRegistry | undefined
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

            if (artifactRegistry != null && packageClassReference != null) {
                artifactRegistry.registerEndpoint(endpoint.id, func, packageClassReference);
            }
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
    headersGenerator: HeadersGenerator,
    retriesProperty: Property,
    timeoutProperty: Property,
    artifactRegistry: ArtifactRegistry,
    oauthTokenProviderClass: Class_ | undefined,
    locationGenerator: LocationGenerator,
    environmentClass?: ClassReference,
    defaultEnvironment?: string,
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

    const initializerBody: AstNode[] = [];
    const asyncInitializerBody: AstNode[] = [];

    const initializerArguments =
        requestClient.initializer?.parameters
            .filter((param) => oauthTokenProviderClass == null || param.name !== OauthTokenProvider.FIELD_NAME)
            .map((param) => param.toArgument(param.name)) ?? [];

    const asyncInitializerArguments =
        requestClient.initializer?.parameters
            .filter((param) => oauthTokenProviderClass == null || param.name !== OauthTokenProvider.FIELD_NAME)
            .map((param) => param.toArgument(param.name)) ?? [];

    if (oauthTokenProviderClass != null) {
        const tokenProviderName = "oauth_provider";
        const oauthProviderVariable = new Variable({
            name: tokenProviderName,
            type: oauthTokenProviderClass.classReference,
            variableType: VariableType.INSTANCE
        });
        const initOauthProvider = new Expression({
            leftSide: oauthProviderVariable,
            rightSide: new FunctionInvocation({
                onObject: oauthTokenProviderClass.classReference,
                baseFunction: oauthTokenProviderClass.initializer,
                arguments_: [
                    ...(oauthTokenProviderClass.initializer?.parameters ?? [])
                        .filter((param) => param.name !== "request_client")
                        .map((param) => param.toArgument(param.name)),
                    new Argument({
                        name: "request_client",
                        value: new FunctionInvocation({
                            onObject: requestClient.classReference,
                            baseFunction: requestClient.initializer,
                            // Spread the array here so we don't lazily pick up the
                            // method call for token we add in down below
                            arguments_: [...initializerArguments]
                        }),
                        isNamed: true
                    })
                ]
            }),
            isAssignment: true
        });

        initializerBody.push(initOauthProvider);
        asyncInitializerBody.push(initOauthProvider);

        initializerArguments.push(
            new Argument({
                name: OauthTokenProvider.FIELD_NAME,
                value: `@${tokenProviderName}.method(:token)`,
                isNamed: true
            })
        );
        asyncInitializerArguments.push(
            new Argument({
                name: OauthTokenProvider.FIELD_NAME,
                value: `@${tokenProviderName}.method(:token)`,
                isNamed: true
            })
        );
    }

    initializerBody.push(
        ...[
            new Expression({
                leftSide: requestClientVariable,
                rightSide: new FunctionInvocation({
                    onObject: requestClient.classReference,
                    baseFunction: requestClient.initializer,
                    arguments_: initializerArguments
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
                        arguments_: sp.initializer?.parameters.map((param) => param.toArgument(requestClientVariable))
                    }),
                    isAssignment: true
                });
            })
        ]
    );

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
                  [],
                  classReference,
                  artifactRegistry
              )
            : [],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            functionBody: initializerBody,
            parameters: getClientParameters(
                "rootClient",
                environmentClass,
                headersGenerator,
                retriesProperty,
                timeoutProperty,
                defaultEnvironment
            ),
            returnValue: classReference
        })
    });

    // Add Async Client class
    const asyncRequestClientVariable = new Variable({
        name: "async_request_client",
        type: asyncRequestClient.classReference,
        variableType: VariableType.INSTANCE
    });
    asyncInitializerBody.push(
        ...[
            new Expression({
                leftSide: asyncRequestClientVariable,
                rightSide: new FunctionInvocation({
                    onObject: asyncRequestClient.classReference,
                    baseFunction: asyncRequestClient.initializer,
                    arguments_: asyncRequestClient.initializer?.parameters.map((param) => param.toArgument(param.name))
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
        ]
    );

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
                  [],
                  undefined,
                  undefined
              )
            : [],
        includeInitializer: false,
        initializerOverride: new Function_({
            name: "initialize",
            invocationName: "new",
            functionBody: asyncInitializerBody,
            parameters: getClientParameters(
                "rootClient",
                environmentClass,
                headersGenerator,
                retriesProperty,
                timeoutProperty,
                defaultEnvironment
            ),
            returnValue: asyncClassReference
        })
    });

    const maybeEnvironmentImport = environmentClass?.import_;
    const typeExporterImport = new Import({ from: typeExporterLocation, isExternal: false });
    const rootNode = Module_.wrapInModules({
        locationGenerator,
        child: [clientClass, asyncClientClass],
        arbitraryImports:
            maybeEnvironmentImport !== undefined ? [maybeEnvironmentImport, typeExporterImport] : [typeExporterImport]
    });

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
    packagePath: string[],
    artifactRegistry: ArtifactRegistry
): ClientClassPair {
    const subpackageName = subpackage.name;
    const serviceName = subpackageName.pascalCase.unsafeName;
    const import_ = new Import({
        from: locationGenerator.getLocationForServiceDeclaration(service.name),
        isExternal: false
    });
    const moduleBreadcrumbs = getBreadcrumbsFromFilepath(service.name.fernFilepath, clientName);

    // Add Client class
    const serviceBasePath = generateRubyPathTemplate(service.pathParameters, service.basePath);
    const requestClientProperty = new Property({ name: "request_client", type: requestClientCr });
    const syncClientClassReference = new ClassReference({
        name: `${serviceName}Client`,
        import_,
        moduleBreadcrumbs
    });
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
            packagePath,
            syncClientClassReference,
            artifactRegistry
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
            packagePath,
            undefined,
            undefined
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
    classReference: ClassReference,
    headersGenerator: HeadersGenerator,
    environmentCr: ClassReference | undefined,
    isMultiBaseUrlEnvironments: boolean,
    retriesProperty: Property,
    timeoutProperty: Property,
    defaultEnvironment?: string,
    hasFileBasedDependencies = false
): Function_ {
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

    let functionBody: AstNode[] = [];

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

    headersGenerator.getAuthHeaders().forEach(([prop_name, prop_value]) =>
        functionBody.push(
            new Expression({
                leftSide: prop_name,
                rightSide: prop_value,
                isAssignment: true
            })
        )
    );

    const headerSetters: AstNode[] = [];
    const headersToSet = headersGenerator.getAdditionalHeadersAsProperties();
    const hasHeaders = headersToSet.length > 0;

    // Make an if statement for each auth scheme that adds the header if present
    headersToSet.forEach((prop) =>
        headerSetters.push(
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

    if (hasHeaders) {
        functionBody = functionBody.concat([
            new Expression({
                leftSide: "@headers",
                rightSide: new HashInstance({}),
                isAssignment: true
            }),
            ...headerSetters
        ]);
    }

    return new Function_({
        name: "initialize",
        invocationName: "new",
        parameters: getClientParameters(
            "requestClient",
            environmentCr,
            headersGenerator,
            retriesProperty,
            timeoutProperty,
            defaultEnvironment
        ),
        returnValue: classReference,
        functionBody: [
            ...functionBody,
            // Set the Faraday connection
            new Expression({
                leftSide: "@conn",
                rightSide: new FunctionInvocation({
                    onObject: new ClassReference({
                        name: "Faraday",
                        import_: new Import({ from: "faraday", isExternal: true })
                    }),
                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                    arguments_: hasHeaders
                        ? [
                              new Argument({
                                  isNamed: true,
                                  name: "headers",
                                  value: "@headers"
                              })
                          ]
                        : undefined,
                    block: { arguments: "faraday", expressions: faradayConfiguration }
                }),
                isAssignment: true
            })
        ]
    });
}

function getClientParameters(
    desiredClient: "rootClient" | "requestClient",
    environmentCr: ClassReference | undefined,
    headersGenerator: HeadersGenerator,
    retriesProperty: Property,
    timeoutProperty: Property,
    defaultEnvironment?: string
): Parameter[] {
    const functionParams = [
        new Parameter({
            name: "base_url",
            type: StringClassReference,
            isOptional: true,
            example: '"https://api.example.com"'
        })
    ];
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
    }

    const initialRequestOverrides: Property[] = [retriesProperty, timeoutProperty];

    return [
        ...functionParams,
        // Select sample of the request overrides object properties
        ...initialRequestOverrides.map((prop) => prop.toParameter({})),
        // Auth headers
        ...headersGenerator.getAuthHeadersAsParameters(desiredClient === "rootClient"),
        // Global headers
        ...headersGenerator.getAdditionalHeadersAsParameters()
    ];
}

function requestClientFunctions(
    requestOptions: RequestOptions,
    baseUrlProperty: Property,
    environmentProperty: Property | undefined,
    isMultiBaseUrlEnvironments: boolean,
    platformHeaders: PlatformHeaders,
    headersGenerator: HeadersGenerator,
    gemName: string,
    sdkVersion: string | undefined
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

    const allHeaders = new Map([
        // SDK Default Headers
        [`"${platformHeaders.language}"`, "Ruby"],
        [`"${platformHeaders.sdkName}"`, gemName]
    ]);
    if (sdkVersion !== undefined) {
        allHeaders.set(`"${platformHeaders.sdkVersion}"`, sdkVersion);
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
        }),
        new Function_({
            name: "get_headers",
            functionBody: [
                new Expression({
                    leftSide: "headers",
                    rightSide: new HashInstance({
                        contents: new Map([...allHeaders.entries()])
                    }),
                    isAssignment: true
                }),
                ...headersGenerator.getAuthHeadersAsProperties().map(
                    (prop) =>
                        new Expression({
                            leftSide: `headers["${prop.wireValue ?? prop.name}"]`,
                            rightSide: `((${prop.toVariable(VariableType.INSTANCE).write({})}.is_a? Method) ? ${prop
                                .toVariable(VariableType.INSTANCE)
                                .write({})}.call : ${prop.toVariable(VariableType.INSTANCE).write({})}) unless ${prop
                                .toVariable(VariableType.INSTANCE)
                                .write({})}.nil?`,
                            isAssignment: true
                        })
                ),
                new Expression({
                    leftSide: "headers",
                    isAssignment: false
                })
            ],
            returnValue: new HashReference({ keyType: StringClassReference, valueType: StringClassReference })
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
    requestOptions: RequestOptions,
    retriesProperty: Property,
    timeoutProperty: Property
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
        new Property({ name: "conn", type: faradayReference }),
        baseUrlProperty,
        ...headersGenerator.getAuthHeadersAsProperties()
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
            clientClassReference,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            retriesProperty,
            timeoutProperty,
            defaultEnvironment,
            hasFileBasedDependencies
        ),
        functions: requestClientFunctions(
            requestOptions,
            baseUrlProperty,
            environmentCr != null ? environmentProperty : undefined,
            isMultiBaseUrlEnvironments,
            sdkConfig.platformHeaders,
            headersGenerator,
            gemName,
            sdkVersion
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
            asyncClientClassReference,
            headersGenerator,
            environmentCr,
            isMultiBaseUrlEnvironments,
            retriesProperty,
            timeoutProperty,
            defaultEnvironment,
            hasFileBasedDependencies
        ),
        functions: requestClientFunctions(
            requestOptions,
            baseUrlProperty,
            environmentCr != null ? environmentProperty : undefined,
            isMultiBaseUrlEnvironments,
            sdkConfig.platformHeaders,
            headersGenerator,
            gemName,
            sdkVersion
        )
    });

    return [clientClass, asyncClientClass];
}

export function getSubpackagePropertyNameFromIr(name: Name): string {
    return name.snakeCase.safeName;
}

export function getOauthAccessTokenFunctionMetadata({
    tokenEndpoint,
    artifactRegistry
}: {
    tokenEndpoint: OAuthTokenEndpoint;
    artifactRegistry: ArtifactRegistry;
}): OauthFunction {
    const endpointId = tokenEndpoint.endpointReference;
    const tokenFunction = artifactRegistry.getEndpointFunction(endpointId);
    const tokenFunctionClientClassReference = artifactRegistry.getEndpointPackage(endpointId);

    if (tokenFunction == null || tokenFunctionClientClassReference == null) {
        throw new Error(`Could not find endpoint function for ${endpointId}`);
    }

    return {
        tokenResponseProperty: tokenEndpoint.responseProperties,
        tokenFunction,
        tokenFunctionClientClassReference
    };
}

export function getOauthRefreshTokenFunctionMetadata({
    refreshEndpoint,
    artifactRegistry
}: {
    refreshEndpoint: OAuthRefreshEndpoint;
    artifactRegistry: ArtifactRegistry;
}): OauthFunction {
    const endpointId = refreshEndpoint.endpointReference;
    const tokenFunction = artifactRegistry.getEndpointFunction(endpointId);
    const tokenFunctionClientClassReference = artifactRegistry.getEndpointPackage(endpointId);

    if (tokenFunction == null || tokenFunctionClientClassReference == null) {
        throw new Error(`Could not find endpoint function for ${endpointId}`);
    }

    return {
        tokenResponseProperty: refreshEndpoint.responseProperties,
        tokenFunction,
        tokenFunctionClientClassReference
    };
}

function generatePathTemplate(templateString: string, pathParameters: PathParameter[], basePath?: HttpPath): string {
    if (basePath === undefined) {
        return "";
    }
    let pathParametersTemplate = basePath.head;
    for (let i = 0; i < basePath.parts.length; i++) {
        const pathPart = pathParameters[i];
        if (pathPart === undefined) {
            continue;
        }
        pathParametersTemplate = pathParametersTemplate.concat(
            `${format(templateString, pathPart.name.snakeCase.safeName)}${basePath.parts[i]?.tail ?? ""}`
        );
    }
    // Strip leading and trailing slashes
    return pathParametersTemplate.replaceAll(/^\/+|\/+$/g, "");
}
