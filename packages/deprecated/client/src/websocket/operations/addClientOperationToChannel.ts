import { WebSocketChannel, WebSocketOperation } from "@fern-fern/ir-model/services/websocket";
import { DependencyManager, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedWebSocketOperationTypes, ModelContext } from "@fern-typescript/model-context";
import {
    ClassDeclaration,
    InterfaceDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    ts,
} from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateOperationMethodBody } from "./operation-method-body/generateOperationMethodBody";

export declare namespace addClientOperationToChannel {
    export interface Args {
        channel: WebSocketChannel;
        channelClass: ClassDeclaration;
        channelInterface: InterfaceDeclaration;
        operation: WebSocketOperation;
        modelContext: ModelContext;
        dependencyManager: DependencyManager;
    }

    export interface Return {
        generatedOperationTypes: GeneratedWebSocketOperationTypes;
    }
}

export function addClientOperationToChannel({
    channel,
    channelInterface,
    channelClass,
    operation,
    modelContext,
    dependencyManager,
}: addClientOperationToChannel.Args): addClientOperationToChannel.Return {
    const channelFile = channelClass.getSourceFile();

    const generatedOperationTypes = modelContext.getGeneratedWebSocketChannelTypes({
        channelName: channel.name,
        operationId: operation.name.camelCase,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedOperationTypes.request.body != null
            ? [
                  {
                      name: ClientConstants.WebsocketChannel.Operation.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          modelContext.getReferenceToWebSocketChannelType({
                              reference: generatedOperationTypes.request.body,
                              referencedIn: channelFile,
                          })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            modelContext.getReferenceToWebSocketChannelType({
                reference: generatedOperationTypes.response.reference,
                referencedIn: channelFile,
            }),
        ])
    );

    channelInterface.addMethod({
        name: operation.name.camelCase,
        parameters,
        returnType,
    });

    channelClass.addMethod({
        name: operation.name.camelCase,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: generateOperationMethodBody({
            operation,
            operationTypes: generatedOperationTypes,
            channelFile,
            dependencyManager,
            modelContext,
        }),
    });

    return { generatedOperationTypes };
}
