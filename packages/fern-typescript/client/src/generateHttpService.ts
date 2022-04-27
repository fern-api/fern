import { HttpService } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode, withDirectory, withSourceFile } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { ClassDeclaration, Directory, Scope, ts } from "ts-morph";
import { addEndpointToService } from "./endpoints/addEndpointToService";
import { generateJoinPathsCall } from "./utils/generateJoinPathsCall";

export function generateHttpService({
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    service,
    typeResolver,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    service: HttpService;
    typeResolver: TypeResolver;
}): void {
    withDirectory(
        {
            containingModule: servicesDirectory,
            name: service.name.name,
            namespaceExport: service.name.name,
        },
        (serviceDirectory) => {
            generateService({
                service,
                serviceDirectory,
                modelDirectory,
                errorsDirectory,
                typeResolver,
            });
        }
    );
}

function generateService({
    service,
    serviceDirectory,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    service: HttpService;
    serviceDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
}) {
    withSourceFile(
        {
            directory: serviceDirectory,
            filepath: `${service.name.name}.ts`,
        },
        (serviceFile) => {
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
                name: "baseUrl",
                scope: Scope.Private,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            });

            serviceClass.addProperty({
                name: "fetcher",
                scope: Scope.Private,
                type: getTextOfTsNode(ts.factory.createIdentifier("Fetcher")),
            });

            addConstructor(serviceClass);

            for (const endpoint of service.endpoints) {
                addEndpointToService({
                    endpoint,
                    serviceInterface,
                    serviceClass,
                    modelDirectory,
                    errorsDirectory,
                    typeResolver,
                });
            }
        }
    );
}
function addConstructor(serviceClass: ClassDeclaration) {
    serviceClass.getSourceFile().addImportDeclaration({
        namedImports: ["Fetcher", "defaultFetcher", "Service"],
        moduleSpecifier: "@fern-typescript/service-utils",
    });

    serviceClass.addConstructor({
        parameters: [
            {
                name: "args",
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier("Service"),
                            ts.factory.createIdentifier("Init")
                        )
                    )
                ),
            },
        ],
        statements: [
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: "fetcher",
                    initialValue: ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("args"),
                            ts.factory.createIdentifier("fetcher")
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createIdentifier("defaultFetcher")
                    ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: "baseUrl",
                    initialValue: generateJoinPathsCall({
                        file: serviceClass.getSourceFile(),
                        paths: [
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("args"),
                                ts.factory.createIdentifier("serverUrl")
                            ),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("args"),
                                ts.factory.createIdentifier("serviceBaseUrl")
                            ),
                        ],
                    }),
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
