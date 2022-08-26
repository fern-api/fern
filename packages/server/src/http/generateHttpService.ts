import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import {
    createDirectoriesForFernFilepath,
    createSourceFileAndExportFromModule,
    DependencyManager,
    getTextOfTsNode,
} from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { getHttpRequestParameters } from "@fern-typescript/service-types";
import { Directory, InterfaceDeclaration, SourceFile, ts, VariableDeclarationKind } from "ts-morph";
import { ServerConstants } from "../constants";
import { generateMaybePromise } from "../utils.ts/generateMaybePromise";
import { getExpressCall, getExpressType } from "./addExpressImport";
import { getExpressRouteStatement } from "./addExpressRouteStatement";

export async function generateHttpService({
    servicesDirectory,
    modelContext,
    service,
    dependencyManager,
}: {
    servicesDirectory: Directory;
    modelContext: ModelContext;
    service: HttpService;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const packageDirectory = createDirectoriesForFernFilepath(servicesDirectory, service.name.fernFilepath);
    const serviceFile = createSourceFileAndExportFromModule(packageDirectory, service.name.name);

    const serviceInterface = serviceFile.addInterface({
        name: service.name.name,
        isExported: true,
    });

    const expressRouteStatements: ts.Statement[] = [];

    for (const endpoint of service.endpoints) {
        addEndpointToService({
            modelContext,
            service,
            endpoint,
            serviceInterface,
            serviceFile,
            expressRouteStatements,
            dependencyManager,
        });
    }

    addMiddleware({ serviceFile, serviceInterface, dependencyManager, expressRouteStatements });
}

function addEndpointToService({
    modelContext,
    service,
    endpoint,
    serviceInterface,
    serviceFile,
    expressRouteStatements,
    dependencyManager,
}: {
    modelContext: ModelContext;
    service: HttpService;
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceFile: SourceFile;
    expressRouteStatements: ts.Statement[];
    dependencyManager: DependencyManager;
}) {
    const generatedEndpointTypes = modelContext.getGeneratedHttpServiceTypes({
        serviceName: service.name,
        endpointId: endpoint.name.camelCase,
    });

    serviceInterface.addMethod({
        name: endpoint.name.camelCase,
        parameters: [
            ...getHttpRequestParameters({
                generatedEndpointTypes,
                modelContext,
                file: serviceFile,
            }),
        ],
        returnType: getTextOfTsNode(
            generateMaybePromise({
                type: modelContext.getReferenceToHttpServiceType({
                    reference: generatedEndpointTypes.response.reference,
                    referencedIn: serviceFile,
                }),
            })
        ),
    });

    expressRouteStatements.push(
        getExpressRouteStatement({
            service,
            endpoint,
            generatedEndpointTypes,
            modelContext,
            dependencyManager,
            file: serviceFile,
        })
    );
}

function addMiddleware({
    serviceFile,
    serviceInterface,
    dependencyManager,
    expressRouteStatements,
}: {
    serviceFile: SourceFile;
    serviceInterface: InterfaceDeclaration;
    dependencyManager: DependencyManager;
    expressRouteStatements: ts.Statement[];
}) {
    serviceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: serviceInterface.getName(),
                initializer: getTextOfTsNode(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ServerConstants.Middleware.FUNCTION_NAME,
                                ts.factory.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [
                                        ts.factory.createParameterDeclaration(
                                            undefined,
                                            undefined,
                                            undefined,
                                            ts.factory.createIdentifier(ServerConstants.Middleware.PARAMETER_NAME),
                                            undefined,
                                            ts.factory.createTypeReferenceNode(
                                                ts.factory.createIdentifier(serviceInterface.getName()),
                                                undefined
                                            ),
                                            undefined
                                        ),
                                    ],
                                    getExpressType({ file: serviceFile, dependencyManager }),
                                    undefined,
                                    ts.factory.createBlock(
                                        generateMiddlewareBody({
                                            serviceFile,
                                            dependencyManager,
                                            expressRouteStatements,
                                        }),
                                        true
                                    )
                                )
                            ),
                        ],
                        true
                    )
                ),
            },
        ],
        isExported: true,
    });
}

function generateMiddlewareBody({
    serviceFile,
    dependencyManager,
    expressRouteStatements,
}: {
    serviceFile: SourceFile;
    dependencyManager: DependencyManager;
    expressRouteStatements: ts.Statement[];
}): ts.Statement[] {
    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(ServerConstants.Middleware.APP_VARIABLE_NAME),
                        undefined,
                        undefined,
                        getExpressCall({ file: serviceFile, dependencyManager })
                    ),
                ],
                ts.NodeFlags.Const
            )
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ServerConstants.Middleware.APP_VARIABLE_NAME),
                    ts.factory.createIdentifier(ServerConstants.Express.AppMethods.USE)
                ),
                undefined,
                [
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ServerConstants.Express.DEFAULT_IMPORT),
                            ts.factory.createIdentifier(ServerConstants.Express.StaticMethods.JSON_MIDDLEWARE)
                        ),
                        undefined,
                        []
                    ),
                ]
            )
        ),
        ...expressRouteStatements,
        ts.factory.createReturnStatement(ts.factory.createIdentifier("app")),
    ];
}
