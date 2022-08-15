import { WebSocketChannel } from "@fern-fern/ir-model/services";
import {
    createDirectoriesForFernFilepath,
    createSourceFileAndExportFromModule,
    DependencyManager,
    getTextOfTsKeyword,
    getTextOfTsNode,
    maybeAddDocs,
} from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
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
    modelContext,
    channel,
    dependencyManager,
}: {
    servicesDirectory: Directory;
    modelContext: ModelContext;
    channel: WebSocketChannel;
    dependencyManager: DependencyManager;
}): void {
    generateChannel({
        channel,
        servicesDirectory,
        modelContext,
        dependencyManager,
    });
}

function generateChannel({
    channel,
    servicesDirectory,
    modelContext,
    dependencyManager,
}: {
    channel: WebSocketChannel;
    servicesDirectory: Directory;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): void {
    const packageDirectory = createDirectoriesForFernFilepath(servicesDirectory, channel.name.fernFilepath);
    const channelFile = createSourceFileAndExportFromModule(packageDirectory, channel.name.name);

    const channelNamespace = addNamespace({ file: channelFile, channel });

    const channelInterface = channelFile.addInterface({
        name: channel.name.name,
        isExported: true,
    });

    const channelClass = channelFile.addClass({
        name: channel.name.name,
        implements: [channel.name.name],
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

    generateChannelConstructor({ channelClass, channelDefinition: channel, dependencyManager });

    const serverMessageTypes: ts.TypeNode[] = [];

    for (const operation of channel.client.operations) {
        const { generatedOperationTypes } = addClientOperationToChannel({
            operation,
            channelClass,
            channelInterface,
            channel,
            modelContext,
            dependencyManager,
        });
        serverMessageTypes.push(
            modelContext.getReferenceToWebSocketChannelType({
                reference: generatedOperationTypes.response.reference,
                referencedIn: channelFile,
            })
        );
    }

    channelNamespace.addTypeAlias({
        name: ClientConstants.WebsocketChannel.Namespace.SERVER_MESSAGE,
        type: getTextOfTsNode(ts.factory.createUnionTypeNode(serverMessageTypes)),
    });

    generateDisconnect({ channelClass });
    generateOnMessage({ channelClass, channelDefinition: channel });
}

function addNamespace({ file, channel }: { file: SourceFile; channel: WebSocketChannel }): ModuleDeclaration {
    const channelNamespace = file.addModule({
        name: channel.name.name,
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
