import { HttpService } from "@fern-fern/ir-model/services";
import {
    createDirectoriesForFernFilepath,
    createSourceFileAndExportFromModule,
    DependencyManager,
    getReferenceToFernServiceUtilsServiceNamespaceType,
    getReferenceToFernServiceUtilsType,
    getReferenceToFernServiceUtilsValue,
    getTextOfTsKeyword,
    getTextOfTsNode,
    maybeAddDocs,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ModelContext } from "@fern-typescript/model-context";
import { ClassDeclaration, Directory, Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { generateJoinUrlPathsCall } from "../utils/generateJoinPathsCall";
import { addEndpointToService } from "./endpoints/addEndpointToService";

export async function generateHttpService({
    servicesDirectory,
    modelContext,
    service,
    helperManager,
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

    const serviceClass = serviceFile.addClass({
        name: service.name.name,
        implements: [service.name.name],
        isExported: true,
    });
    maybeAddDocs(serviceClass, service.docs);

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.BASE_URL,
        scope: Scope.Private,
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.FETCHER,
        scope: Scope.Private,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({ type: "Fetcher", dependencyManager, referencedIn: serviceFile })
        ),
    });

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.TOKEN,
        scope: Scope.Private,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({
                type: "MaybeGetter",
                dependencyManager,
                referencedIn: serviceFile,
                typeArguments: [
                    ts.factory.createUnionTypeNode([
                        getReferenceToFernServiceUtilsType({
                            type: "Token",
                            dependencyManager,
                            referencedIn: serviceFile,
                        }),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ]),
                ],
            })
        ),
    });

    addConstructor({ serviceClass, serviceDefinition: service, dependencyManager });

    for (const endpoint of service.endpoints) {
        await addEndpointToService({
            endpoint,
            serviceInterface,
            serviceClass,
            serviceDefinition: service,
            modelContext,
            helperManager,
            dependencyManager,
        });
    }
}
function addConstructor({
    serviceClass,
    serviceDefinition,
    dependencyManager,
}: {
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    dependencyManager: DependencyManager;
}) {
    const SERVICE_INIT_PARAMETER_NAME = "args";

    const serviceFile = serviceClass.getSourceFile();

    serviceClass.addConstructor({
        parameters: [
            {
                name: SERVICE_INIT_PARAMETER_NAME,
                type: getTextOfTsNode(
                    getReferenceToFernServiceUtilsServiceNamespaceType({
                        type: "Init",
                        dependencyManager,
                        referencedIn: serviceFile,
                    })
                ),
            },
        ],
        statements: [
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.HttpService.PrivateMembers.FETCHER,
                    initialValue: ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                            ts.factory.createIdentifier(
                                ClientConstants.HttpService.ServiceUtils.ServiceInit.Properties.FETCHER
                            )
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        getReferenceToFernServiceUtilsValue({
                            value: "defaultFetcher",
                            dependencyManager,
                            referencedIn: serviceFile,
                        })
                    ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.HttpService.PrivateMembers.BASE_URL,
                    initialValue:
                        serviceDefinition.basePath != null
                            ? generateJoinUrlPathsCall({
                                  file: serviceClass.getSourceFile(),
                                  dependencyManager,
                                  paths: [
                                      ts.factory.createPropertyAccessExpression(
                                          ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                          ts.factory.createIdentifier(
                                              ClientConstants.HttpService.ServiceUtils.ServiceInit.Properties.ORIGIN
                                          )
                                      ),
                                      ts.factory.createStringLiteral(serviceDefinition.basePath),
                                  ],
                              })
                            : ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                  ts.factory.createIdentifier(
                                      ClientConstants.HttpService.ServiceUtils.ServiceInit.Properties.ORIGIN
                                  )
                              ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: ClientConstants.HttpService.PrivateMembers.TOKEN,
                    initialValue: ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                        ts.factory.createIdentifier(
                            ClientConstants.HttpService.ServiceUtils.ServiceInit.Properties.TOKEN
                        )
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
