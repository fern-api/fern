import { HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, ModuleDeclaration, ts } from "ts-morph";
import { File } from "../../client/types";
import { ClientConstants } from "../constants";

const SERVICE_INIT_PARAMETER_NAME = "args";

export function addServiceConstructor({
    serviceClass,
    serviceModule,
    serviceDefinition,
    file,
}: {
    serviceClass: ClassDeclaration;
    serviceModule: ModuleDeclaration;
    serviceDefinition: HttpService;
    file: File;
}): void {
    serviceClass.addConstructor({
        parameters: [
            {
                name: SERVICE_INIT_PARAMETER_NAME,
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(serviceModule.getName()),
                            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Init.TYPE_NAME)
                        )
                    )
                ),
            },
        ],
        statements: getConstructorStatements({
            serviceDefinition,
            file,
        }).map(getTextOfTsNode),
    });
}

function getConstructorStatements({
    serviceDefinition,
    file,
}: {
    serviceDefinition: HttpService;
    file: File;
}): ts.Statement[] {
    const statements: ts.Statement[] = [
        createClassMemberAssignment({
            member: ClientConstants.HttpService.PrivateMembers.BASE_URL,
            initialValue:
                serviceDefinition.basePath != null
                    ? file.externalDependencies.urlJoin.invoke([
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                              ts.factory.createIdentifier(
                                  ClientConstants.HttpService.ServiceNamespace.Init.Properties.BASE_PATH
                              )
                          ),
                          ts.factory.createStringLiteral(serviceDefinition.basePath),
                      ])
                    : ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                          ts.factory.createIdentifier(
                              ClientConstants.HttpService.ServiceNamespace.Init.Properties.BASE_PATH
                          )
                      ),
        }),
    ];

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
