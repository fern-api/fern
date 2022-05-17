import { HttpService } from "@fern-api/api";
import {
    getOrCreateDirectory,
    getOrCreateSourceFile,
    getRelativePathAsModuleSpecifierTo,
    getTextOfTsKeyword,
    getTextOfTsNode,
    TypeResolver,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ClassDeclaration, Directory, Scope, ts } from "ts-morph";
import { ClientConstants } from "./constants";
import { addEndpointToService } from "./endpoints/addEndpointToService";
import { generateJoinPathsCall } from "./utils/generateJoinPathsCall";

const SERVICE_INIT_TYPE = ts.factory.createTypeReferenceNode(
    ts.factory.createQualifiedName(
        ts.factory.createIdentifier(ClientConstants.Service.ServiceUtils.Imported.SERVICE_NAMESPACE),
        ts.factory.createIdentifier(ClientConstants.Service.ServiceUtils.ServiceInit.TYPE_NAME)
    )
);

export async function generateHttpService({
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    encodersDirectory,
    service,
    typeResolver,
    helperManager,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    encodersDirectory: Directory;
    service: HttpService;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const serviceDirectory = getOrCreateDirectory(servicesDirectory, service.name.name, {
        exportOptions: {
            type: "namespace",
            namespace: service.name.name,
        },
    });
    await generateService({
        service,
        serviceDirectory,
        modelDirectory,
        errorsDirectory,
        encodersDirectory,
        typeResolver,
        helperManager,
    });
}

async function generateService({
    service,
    serviceDirectory,
    modelDirectory,
    errorsDirectory,
    encodersDirectory,
    typeResolver,
    helperManager,
}: {
    service: HttpService;
    serviceDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    encodersDirectory: Directory;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const serviceFile = getOrCreateSourceFile(serviceDirectory, `${service.name.name}.ts`);
    serviceFile.addImportDeclaration({
        namedImports: [
            ClientConstants.Service.ServiceUtils.Imported.FETCHER_TYPE_NAME,
            ClientConstants.Service.ServiceUtils.Imported.DEFAULT_FETCHER,
            ClientConstants.Service.ServiceUtils.Imported.SERVICE_NAMESPACE,
            ClientConstants.Service.ServiceUtils.Imported.IS_RESPONSE_OK_FUNCTION,
        ],
        moduleSpecifier: "@fern-typescript/service-utils",
    });

    const serviceInterface = serviceFile.addInterface({
        name: "Client",
        isExported: true,
    });

    const serviceClass = serviceFile.addClass({
        name: serviceInterface.getName(),
        implements: [serviceInterface.getName()],
        isExported: true,
    });

    serviceClass.addProperty({
        name: ClientConstants.Service.PrivateMembers.BASE_URL,
        scope: Scope.Private,
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    serviceClass.addProperty({
        name: ClientConstants.Service.PrivateMembers.FETCHER,
        scope: Scope.Private,
        type: getTextOfTsNode(
            ts.factory.createIdentifier(ClientConstants.Service.ServiceUtils.Imported.FETCHER_TYPE_NAME)
        ),
    });

    serviceClass.addProperty({
        name: ClientConstants.Service.PrivateMembers.TOKEN,
        scope: Scope.Private,
        type: getTextOfTsNode(
            ts.factory.createIndexedAccessTypeNode(
                SERVICE_INIT_TYPE,
                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("token"))
            )
        ),
    });

    addConstructor({ serviceClass, serviceDefinition: service });

    const endpointsDirectory = getOrCreateDirectory(serviceDirectory, ClientConstants.Files.ENDPOINTS_DIRECTORY_NAME, {
        exportOptions: {
            type: "namespace",
            namespace: "EndpointTypes",
        },
    });

    serviceFile.addImportDeclaration({
        namespaceImport: ClientConstants.Service.NamespaceImports.ENDPOINTS,
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(serviceFile, endpointsDirectory),
    });

    serviceFile.addImportDeclaration({
        namespaceImport: ClientConstants.Service.NamespaceImports.ENCODERS,
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(serviceFile, encodersDirectory),
    });

    for (const endpoint of service.endpoints) {
        await addEndpointToService({
            endpoint,
            serviceInterface,
            serviceClass,
            serviceDefinition: service,
            modelDirectory,
            errorsDirectory,
            endpointsDirectory,
            typeResolver,
            helperManager,
        });
    }
}
function addConstructor({
    serviceClass,
    serviceDefinition,
}: {
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
}) {
    const SERVICE_INIT_PARAMETER_NAME = "args";
    serviceClass.addConstructor({
        parameters: [
            {
                name: SERVICE_INIT_PARAMETER_NAME,
                type: getTextOfTsNode(SERVICE_INIT_TYPE),
            },
        ],
        statements: [
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.Service.PrivateMembers.FETCHER,
                    initialValue: ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                            ts.factory.createIdentifier(
                                ClientConstants.Service.ServiceUtils.ServiceInit.Properties.FETCHER
                            )
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createIdentifier(ClientConstants.Service.ServiceUtils.Imported.DEFAULT_FETCHER)
                    ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.Service.PrivateMembers.BASE_URL,
                    initialValue:
                        serviceDefinition.basePath != null
                            ? generateJoinPathsCall({
                                  file: serviceClass.getSourceFile(),
                                  paths: [
                                      ts.factory.createPropertyAccessExpression(
                                          ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                          ts.factory.createIdentifier(
                                              ClientConstants.Service.ServiceUtils.ServiceInit.Properties.SERVER_URL
                                          )
                                      ),
                                      ts.factory.createStringLiteral(serviceDefinition.basePath),
                                  ],
                              })
                            : ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                  ts.factory.createIdentifier(
                                      ClientConstants.Service.ServiceUtils.ServiceInit.Properties.SERVER_URL
                                  )
                              ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.Service.PrivateMembers.TOKEN,
                    initialValue: ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                        ts.factory.createIdentifier(ClientConstants.Service.ServiceUtils.ServiceInit.Properties.TOKEN)
                    ),
                })
            ),
        ],
    });
}

function createClassMemberAssignment({
    member,
    initialValue,
}: {
    member: string;
    initialValue: ts.Expression;
}): ts.ExpressionStatement {
    return ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), ts.factory.createIdentifier(member)),
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            initialValue
        )
    );
}
