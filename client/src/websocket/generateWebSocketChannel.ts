import { WebSocketChannel } from "@fern-api/api";
import {
    DependencyManager,
    getOrCreateDirectory,
    getOrCreateSourceFile,
    getTextOfTsKeyword,
    getTextOfTsNode,
    maybeAddDocs,
    TypeResolver,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { getLocalServiceTypeReference } from "@fern-typescript/service-types";
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
import { generateChannelConstructor } from "./generateChannelConstructor";
import { generateDisconnect } from "./generateDisconnect";
import { generateOnMessage } from "./generateOnMessage";
import { addClientOperationToChannel } from "./operations/addClientOperationToChannel";

export function generateWebSocketChannel({
    servicesDirectory,
    modelDirectory,
    channel,
    typeResolver,
    dependencyManager,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    encodersDirectory: Directory;
    channel: WebSocketChannel;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): void {
    const channelDirectory = getOrCreateDirectory(servicesDirectory, channel.name.name, {
        exportOptions: {
            type: "namespace",
            namespace: channel.name.name,
        },
    });
    generateChannel({
        channel,
        channelDirectory,
        modelDirectory,
        servicesDirectory,
        typeResolver,
        dependencyManager,
    });
}

function generateChannel({
    channel,
    channelDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    channelDirectory: Directory;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): void {
    const channelFile = getOrCreateSourceFile(channelDirectory, `${channel.name.name}.ts`);
    const channelNamespace = addNamespace({ file: channelFile });

    const channelInterface = channelFile.addInterface({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        isExported: true,
    });

    const channelClass = channelFile.addClass({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        implements: [ClientConstants.WebsocketChannel.CLIENT_NAME],
        isExported: true,
    });
    maybeAddDocs(channelClass, channel.docs);

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
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                        ),
                    ],
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                ),
            ])
        ),
        initializer: getTextOfTsNode(ts.factory.createObjectLiteralExpression([])),
    });

    generateChannelConstructor({ channelClass, channelDefinition: channel, file: channelFile });

    const serverMessageTypes: ts.TypeNode[] = [];

    for (const operation of channel.client.operations) {
        const { generatedOperationTypes } = addClientOperationToChannel({
            operation,
            channelClass,
            channelInterface,
            channel,
            modelDirectory,
            servicesDirectory,
            typeResolver,
            dependencyManager,
        });
        serverMessageTypes.push(
            getLocalServiceTypeReference({
                serviceOrChannelName: channel.name,
                typeName: generatedOperationTypes.response.reference.typeName,
                endpointOrOperationId: operation.operationId,
                servicesDirectory,
                referencedIn: channelFile,
            })
        );
    }

    channelNamespace.addTypeAlias({
        name: ClientConstants.WebsocketChannel.Namespace.SERVER_MESSAGE,
        type: getTextOfTsNode(ts.factory.createUnionTypeNode(serverMessageTypes)),
    });

    generateDisconnect({ channelClass });
    generateOnMessage({ channelClass });
}

function addNamespace({ file }: { file: SourceFile }): ModuleDeclaration {
    const channelNamespace = file.addModule({
        name: ClientConstants.WebsocketChannel.CLIENT_NAME,
        isExported: true,
        hasDeclareKeyword: true,
    });
    addArgsToNamespace({ channelNamespace });
    return channelNamespace;
}

function addArgsToNamespace({ channelNamespace }: { channelNamespace: ModuleDeclaration }) {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: ClientConstants.WebsocketChannel.Namespace.Args.Properties.ORIGIN,
            type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
        },
    ];

    // TODO add token if auth is required

    channelNamespace.addInterface({
        name: ClientConstants.WebsocketChannel.Namespace.Args.TYPE_NAME,
        properties,
    });
}
