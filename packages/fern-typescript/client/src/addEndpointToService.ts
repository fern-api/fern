import { HttpEndpoint, WireMessage } from "@fern-api/api";
import {
    assertNever,
    generateTypeReference,
    getTextOfTsNode,
    withDirectory,
    withSourceFile,
} from "@fern-api/typescript-commons";
import { generateType, TypeResolver } from "@fern-api/typescript-model";
import { ClassDeclaration, Directory, InterfaceDeclaration, Scope, SourceFile, ts } from "ts-morph";

export function addEndpointToService({
    endpoint,
    serviceFile,
    serviceInterface,
    serviceClass,
    modelDirectory,
    endpointsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceFile: SourceFile;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    modelDirectory: Directory;
    endpointsDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const signature = createEndpointSignature({
        endpoint,
        serviceFile,
        modelDirectory,
        endpointsDirectory,
        typeResolver,
    });

    serviceInterface.addProperty({
        name: endpoint.endpointId,
        type: getTextOfTsNode(ts.factory.createFunctionTypeNode(undefined, signature.parameters, signature.returnType)),
    });

    serviceClass.addProperty({
        name: endpoint.endpointId,
        scope: Scope.Public,
        initializer: getTextOfTsNode(
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                signature.parameters.map((parameter) =>
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        parameter.name,
                        undefined,
                        parameter.type
                    )
                ),
                signature.returnType,
                undefined,
                ts.factory.createBlock(
                    [
                        ts.factory.createReturnStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("Promise"),
                                    ts.factory.createIdentifier("reject")
                                ),
                                undefined,
                                []
                            )
                        ),
                    ],
                    true
                )
            )
        ),
    });
}

interface EndpointSignature {
    parameters: ts.ParameterDeclaration[];
    returnType: ts.TypeNode;
}

function createEndpointSignature({
    endpoint,
    serviceFile,
    modelDirectory,
    endpointsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceFile: SourceFile;
    modelDirectory: Directory;
    endpointsDirectory: Directory;
    typeResolver: TypeResolver;
}): EndpointSignature {
    const parameters: ts.ParameterDeclaration[] = [];

    for (const pathParameter of endpoint.parameters) {
        parameters.push(
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                pathParameter.key,
                undefined,
                generateTypeReference({ reference: pathParameter.valueType, referencedIn: serviceFile, modelDirectory })
            )
        );
    }

    if (endpoint.request != null) {
        parameters.push(
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                "request",
                undefined,
                generateWireMessage({
                    typeName: "Request",
                    wireMessage: endpoint.request,
                    endpointId: endpoint.endpointId,
                    serviceFile,
                    modelDirectory,
                    endpointsDirectory,
                    typeResolver,
                })
            )
        );
    }

    const returnType = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
        endpoint.response != null
            ? generateWireMessage({
                  typeName: "Response",
                  wireMessage: endpoint.response,
                  endpointId: endpoint.endpointId,
                  serviceFile,
                  modelDirectory,
                  endpointsDirectory,
                  typeResolver,
              })
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
    ]);

    return {
        parameters,
        returnType,
    };
}

function generateWireMessage({
    typeName,
    wireMessage,
    endpointId,
    serviceFile,
    modelDirectory,
    endpointsDirectory,
    typeResolver,
}: {
    typeName: string;
    wireMessage: WireMessage;
    endpointId: string;
    serviceFile: SourceFile;
    modelDirectory: Directory;
    endpointsDirectory: Directory;
    typeResolver: TypeResolver;
}): ts.TypeNode {
    switch (wireMessage.type._type) {
        case "alias":
            return generateTypeReference({
                reference: wireMessage.type.aliasOf,
                referencedIn: serviceFile,
                modelDirectory,
            });
        case "object":
        case "union":
        case "enum":
            withDirectory(
                {
                    containingModule: endpointsDirectory,
                    name: endpointId,
                    namespaceExport: endpointId,
                },
                (endpointDirectory) => {
                    withSourceFile(
                        {
                            directory: endpointDirectory,
                            filepath: `${typeName}.ts`,
                        },
                        (wireMessageFile) => {
                            generateType({
                                type: wireMessage.type,
                                docs: wireMessage.docs,
                                typeName,
                                typeResolver,
                                modelDirectory,
                                file: wireMessageFile,
                            });

                            serviceFile.addImportDeclaration({
                                namespaceImport: "endpoints",
                                moduleSpecifier: serviceFile.getRelativePathAsModuleSpecifierTo(endpointsDirectory),
                            });
                        }
                    );
                }
            );

            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier("endpoints"),
                        ts.factory.createIdentifier(endpointId)
                    ),
                    ts.factory.createIdentifier(typeName)
                ),
                undefined
            );
        default:
            assertNever(wireMessage.type);
    }
}
