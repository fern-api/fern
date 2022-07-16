import { HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager, getReferenceToFernServiceUtilsValue, getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { generateJoinUrlPathsCall } from "../utils/generateJoinPathsCall";
import { doesServiceHaveBasicAuth, doesServiceHaveBearerAuth, doesServiceHaveHeaders } from "./utils";

const SERVICE_INIT_PARAMETER_NAME = "args";

export function addServiceConstructor({
    serviceClass,
    serviceDefinition,
    dependencyManager,
}: {
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    dependencyManager: DependencyManager;
}): void {
    serviceClass.addConstructor({
        parameters: [
            {
                name: SERVICE_INIT_PARAMETER_NAME,
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(serviceDefinition.name.name),
                            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Init.TYPE_NAME)
                        )
                    )
                ),
            },
        ],
        statements: getConstructorStatements({
            serviceClass,
            serviceDefinition,
            dependencyManager,
        }).map(getTextOfTsNode),
    });
}

function getConstructorStatements({
    serviceClass,
    serviceDefinition,
    dependencyManager,
}: {
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    dependencyManager: DependencyManager;
}): ts.Statement[] {
    const statements: ts.Statement[] = [
        createClassMemberAssignment({
            member: ClientConstants.HttpService.PrivateMembers.FETCHER,
            initialValue: ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                    ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Init.Properties.FETCHER)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                getReferenceToFernServiceUtilsValue({
                    value: "defaultFetcher",
                    dependencyManager,
                    referencedIn: serviceClass.getSourceFile(),
                })
            ),
        }),
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
                                      ClientConstants.HttpService.ServiceNamespace.Init.Properties.ORIGIN
                                  )
                              ),
                              ts.factory.createStringLiteral(serviceDefinition.basePath),
                          ],
                      })
                    : ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                          ts.factory.createIdentifier(
                              ClientConstants.HttpService.ServiceNamespace.Init.Properties.ORIGIN
                          )
                      ),
        }),
    ];

    if (doesServiceHaveBearerAuth(serviceDefinition).hasAuth) {
        statements.push(
            createClassMemberAssignment({
                member: ClientConstants.HttpService.PrivateMembers.BEARER_TOKEN,
                initialValue: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                    ts.factory.createIdentifier(
                        ClientConstants.HttpService.ServiceNamespace.Init.Properties.BEARER_TOKEN
                    )
                ),
            })
        );
    }

    if (doesServiceHaveBasicAuth(serviceDefinition).hasAuth) {
        statements.push(
            createClassMemberAssignment({
                member: ClientConstants.HttpService.PrivateMembers.BASIC_AUTH,
                initialValue: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                    ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Init.Properties.BASIC_AUTH)
                ),
            })
        );
    }

    if (doesServiceHaveHeaders(serviceDefinition)) {
        statements.push(
            createClassMemberAssignment({
                member: ClientConstants.HttpService.PrivateMembers.HEADERS,
                initialValue: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                    ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Init.Properties.HEADERS)
                ),
            })
        );
    }

    return statements;
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
