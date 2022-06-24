import { HttpEndpoint, HttpService } from "@fern-api/api";
import {
    createDirectoriesForFernFilepath,
    createSourceFileAndExportFromModule,
    DependencyManager,
    getTextOfTsNode,
    ModelContext,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
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
    helperManager: HelperManager;
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
}: {
    modelContext: ModelContext;
    service: HttpService;
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceFile: SourceFile;
    expressRouteStatements: ts.Statement[];
}) {
    const generatedEndpointTypes = modelContext.getGeneratedHttpServiceTypes({
        serviceName: service.name,
        endpointId: endpoint.endpointId,
    });

    serviceInterface.addMethod({
        name: endpoint.endpointId,
        parameters: getHttpRequestParameters({ generatedEndpointTypes, modelContext, file: serviceFile }),
        returnType: getTextOfTsNode(
            generateMaybePromise(
                modelContext.getReferenceToHttpServiceType({
                    reference: generatedEndpointTypes.response.reference,
                    referencedIn: serviceFile,
                })
            )
        ),
    });

    expressRouteStatements.push(
        getExpressRouteStatement({
            service,
            endpoint,
            generatedEndpointTypes,
            modelContext,
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
                                        [
                                            ts.factory.createVariableStatement(
                                                undefined,
                                                ts.factory.createVariableDeclarationList(
                                                    [
                                                        ts.factory.createVariableDeclaration(
                                                            ts.factory.createIdentifier(
                                                                ServerConstants.Middleware.APP_VARIABLE_NAME
                                                            ),
                                                            undefined,
                                                            undefined,
                                                            getExpressCall({ file: serviceFile, dependencyManager })
                                                        ),
                                                    ],
                                                    ts.NodeFlags.Const
                                                )
                                            ),
                                            ...expressRouteStatements,
                                            ts.factory.createReturnStatement(ts.factory.createIdentifier("app")),
                                        ],
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
