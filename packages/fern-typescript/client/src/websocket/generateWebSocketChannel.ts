import { WebSocketChannel } from "@fern-api/api";
import {
    getOrCreateDirectory,
    getOrCreateSourceFile,
    getRelativePathAsModuleSpecifierTo,
    getTextOfTsKeyword,
    getTextOfTsNode,
    getTypeReference,
    TypeResolver,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import {
    Directory,
    ModuleDeclaration,
    OptionalKind,
    PropertySignatureStructure,
    Scope,
    SourceFile,
    ts,
} from "ts-morph";
import { ClientConstants } from "../constants";
import { generateServiceTypeReference } from "../service-types/generateServiceTypeReference";
import { ServiceTypeReference } from "../service-types/types";
import { generateChannelConstructor } from "./generateChannelConstructor";
import { generateConstructRequestHelper } from "./generateConstructRequestHelper";

export async function generateWebSocketChannel({
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    encodersDirectory,
    channel,
    typeResolver,
    helperManager,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    encodersDirectory: Directory;
    channel: WebSocketChannel;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const channelDirectory = getOrCreateDirectory(servicesDirectory, channel.name.name, {
        exportOptions: {
            type: "namespace",
            namespace: channel.name.name,
        },
    });
    await generateChannel({
        channel,
        channelDirectory,
        modelDirectory,
        errorsDirectory,
        encodersDirectory,
        servicesDirectory,
        typeResolver,
        helperManager,
    });
}

async function generateChannel({
    channel,
    channelDirectory,
    modelDirectory,
    typeResolver,
}: {
    channel: WebSocketChannel;
    channelDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    servicesDirectory: Directory;
    encodersDirectory: Directory;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const channelFile = getOrCreateSourceFile(channelDirectory, `${channel.name.name}.ts`);

    const initTypeReference = generateInitTypeReference({ file: channelFile, channel, modelDirectory, typeResolver });
    addNamespace({ file: channelFile, modelDirectory, initTypeReference, channelDefinition: channel });

    channelFile.addInterface({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        isExported: true,
    });

    const channelClass = channelFile.addClass({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        implements: [ClientConstants.WebsocketChannel.CLIENT_NAME],
        isExported: true,
    });

    channelClass.addProperty({
        name: ClientConstants.WebsocketChannel.PrivateMembers.SOCKET,
        scope: Scope.Private,
        type: getTextOfTsNode(
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("WebSocket")),
            ])
        ),
    });

    channelClass.addProperty({
        name: ClientConstants.WebsocketChannel.PrivateMembers.CALLBACKS,
        scope: Scope.Private,
        type: getTextOfTsNode(
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ts.factory.createFunctionTypeNode(
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("response"),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                        ),
                    ],
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                ),
            ])
        ),
        initializer: getTextOfTsNode(ts.factory.createObjectLiteralExpression([])),
    });

    generateChannelConstructor({ channelClass, channelDefinition: channel, initTypeReference, file: channelFile });

    // TODO generate operation method calls

    generateConstructRequestHelper({ channelClass, channelDefinition: channel, file: channelFile });
}

function generateInitTypeReference({
    file,
    channel,
    modelDirectory,
    typeResolver,
}: {
    file: SourceFile;
    channel: WebSocketChannel;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): ServiceTypeReference | undefined {
    const initTypeReference = generateServiceTypeReference({
        typeName: ClientConstants.WebsocketChannel.Namespace.Args.Properties.Init.TYPE_NAME,
        type: channel.init.type,
        docs: channel.init.docs,
        typeDirectory: file.getDirectory(),
        modelDirectory,
        typeResolver,
    });

    if (initTypeReference != null && initTypeReference.isLocal) {
        file.addImportDeclaration({
            namedImports: [ClientConstants.WebsocketChannel.Namespace.Args.Properties.Init.TYPE_NAME],
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(file, initTypeReference.file),
        });
    }

    return initTypeReference;
}

function addNamespace({
    file,
    modelDirectory,
    channelDefinition,
    initTypeReference,
}: {
    file: SourceFile;
    modelDirectory: Directory;
    channelDefinition: WebSocketChannel;
    initTypeReference: ServiceTypeReference | undefined;
}) {
    const serviceNamespace = file.addModule({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        isExported: true,
        hasDeclareKeyword: true,
    });

    addArgsToNamespace({ serviceNamespace, modelDirectory, initTypeReference, file });
    addRequestToNamespace({ serviceNamespace, channelDefinition });
    addResponseToNamespace({ serviceNamespace, channelDefinition });
}

function addArgsToNamespace({
    serviceNamespace,
    modelDirectory,
    initTypeReference,
    file,
}: {
    serviceNamespace: ModuleDeclaration;
    modelDirectory: Directory;
    initTypeReference: ServiceTypeReference | undefined;
    file: SourceFile;
}) {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: ClientConstants.WebsocketChannel.Namespace.Args.Properties.ORIGIN,
            type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
        },
    ];

    if (initTypeReference != null) {
        properties.push({
            name: ClientConstants.WebsocketChannel.Namespace.Args.Properties.Init.NAME,
            type: initTypeReference.isLocal
                ? initTypeReference.typeName
                : getTextOfTsNode(
                      getTypeReference({
                          reference: initTypeReference.typeReference,
                          referencedIn: file,
                          modelDirectory,
                      })
                  ),
        });
    }

    serviceNamespace.addInterface({
        name: ClientConstants.WebsocketChannel.Namespace.Args.TYPE_NAME,
        properties,
    });
}

function addRequestToNamespace({
    serviceNamespace,
    channelDefinition,
}: {
    serviceNamespace: ModuleDeclaration;
    channelDefinition: WebSocketChannel;
}) {
    const MESSAGE_TYPE_PARAMETER = "T";

    serviceNamespace.addInterface({
        name: ClientConstants.WebsocketChannel.Namespace.CLIENT_MESSAGE,
        typeParameters: [
            {
                name: MESSAGE_TYPE_PARAMETER,
                default: "unknown",
            },
        ],
        properties: [
            {
                name: channelDefinition.operationProperties.id,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: channelDefinition.operationProperties.operation,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: channelDefinition.operationProperties.body,
                type: MESSAGE_TYPE_PARAMETER,
            },
        ],
    });
}

function addResponseToNamespace({
    serviceNamespace,
    channelDefinition,
}: {
    serviceNamespace: ModuleDeclaration;
    channelDefinition: WebSocketChannel;
}) {
    const MESSAGE_TYPE_PARAMETER = "T";

    serviceNamespace.addInterface({
        name: ClientConstants.WebsocketChannel.Namespace.SERVER_MESSAGE,
        typeParameters: [
            {
                name: MESSAGE_TYPE_PARAMETER,
                default: "unknown",
            },
        ],
        properties: [
            {
                name: channelDefinition.operationProperties.id,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: channelDefinition.operationProperties.operation,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
                hasQuestionToken: true,
            },
            {
                name: channelDefinition.operationProperties.body,
                type: MESSAGE_TYPE_PARAMETER,
            },
        ],
    });
}
