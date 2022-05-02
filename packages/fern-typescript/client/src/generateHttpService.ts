import { HttpService } from "@fern-api/api";
import {
    getOrCreateDirectory,
    getOrCreateSourceFile,
    getRelativePathAsModuleSpecifierTo,
    getTextOfTsKeyword,
    getTextOfTsNode,
    TypeResolver,
} from "@fern-typescript/commons";
import { ClassDeclaration, Directory, Scope, ts } from "ts-morph";
import {
    BASE_URL_SERVICE_MEMBER,
    ENDPOINTS_DIRECTORY_NAME,
    ENDPOINTS_NAMESPACE_IMPORT,
    FETCHER_SERVICE_MEMBER,
    SERVICE_INIT_FETCHER_PROPERTY_NAME,
    SERVICE_INIT_SERVER_URL_PROPERTY_NAME,
    SERVICE_INIT_SERVICE_BASE_URL_PROPERTY_NAME,
    SERVICE_INIT_TOKEN_PROPERTY_NAME,
    TOKEN_SERVICE_MEMBER,
} from "./constants";
import { addEndpointToService } from "./endpoints/addEndpointToService";
import { generateJoinPathsCall } from "./utils/generateJoinPathsCall";

const SERVICE_INIT_TYPE = ts.factory.createTypeReferenceNode(
    ts.factory.createQualifiedName(ts.factory.createIdentifier("Service"), ts.factory.createIdentifier("Init"))
);

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
    const serviceDirectory = getOrCreateDirectory(servicesDirectory, service.name.name, {
        exportOptions: {
            type: "namespace",
            namespace: service.name.name,
        },
    });
    generateService({
        service,
        serviceDirectory,
        modelDirectory,
        errorsDirectory,
        typeResolver,
    });
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
    const serviceFile = getOrCreateSourceFile(serviceDirectory, `${service.name.name}.ts`);
    serviceFile.addImportDeclaration({
        namedImports: ["Fetcher", "defaultFetcher", "Service"],
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
        name: BASE_URL_SERVICE_MEMBER,
        scope: Scope.Private,
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    serviceClass.addProperty({
        name: FETCHER_SERVICE_MEMBER,
        scope: Scope.Private,
        type: getTextOfTsNode(ts.factory.createIdentifier("Fetcher")),
    });

    serviceClass.addProperty({
        name: TOKEN_SERVICE_MEMBER,
        scope: Scope.Private,
        type: getTextOfTsNode(
            ts.factory.createIndexedAccessTypeNode(
                SERVICE_INIT_TYPE,
                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("token"))
            )
        ),
    });

    addConstructor(serviceClass);

    const endpointsDirectory = getOrCreateDirectory(serviceDirectory, ENDPOINTS_DIRECTORY_NAME, {
        exportOptions: {
            type: "namespace",
            namespace: "EndpointTypes",
        },
    });

    serviceFile.addImportDeclaration({
        namespaceImport: ENDPOINTS_NAMESPACE_IMPORT,
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(serviceFile, endpointsDirectory),
    });

    for (const endpoint of service.endpoints) {
        addEndpointToService({
            endpoint,
            serviceInterface,
            serviceClass,
            modelDirectory,
            errorsDirectory,
            endpointsDirectory,
            typeResolver,
        });
    }
}
function addConstructor(serviceClass: ClassDeclaration) {
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
                    member: FETCHER_SERVICE_MEMBER,
                    initialValue: ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                            ts.factory.createIdentifier(SERVICE_INIT_FETCHER_PROPERTY_NAME)
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createIdentifier("defaultFetcher")
                    ),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: BASE_URL_SERVICE_MEMBER,
                    initialValue: generateJoinPathsCall({
                        file: serviceClass.getSourceFile(),
                        paths: [
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                ts.factory.createIdentifier(SERVICE_INIT_SERVER_URL_PROPERTY_NAME)
                            ),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                                ts.factory.createIdentifier(SERVICE_INIT_SERVICE_BASE_URL_PROPERTY_NAME)
                            ),
                        ],
                    }),
                })
            ),
            getTextOfTsNode(
                createClassMemberAssignment({
                    member: TOKEN_SERVICE_MEMBER,
                    initialValue: ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(SERVICE_INIT_PARAMETER_NAME),
                        ts.factory.createIdentifier(SERVICE_INIT_TOKEN_PROPERTY_NAME)
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
