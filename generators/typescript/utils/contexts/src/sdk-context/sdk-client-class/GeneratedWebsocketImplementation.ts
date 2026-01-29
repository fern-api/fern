import { WebSocketChannel } from "@fern-api/ir-sdk";
import { InterfaceDeclarationStructure, OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { SdkContext } from "../SdkContext";

export interface ChannelSignature {
    parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedWebsocketImplementation {
    channel: WebSocketChannel;
    getSignature: (context: SdkContext) => ChannelSignature;
    getModuleStatement: (context: SdkContext) => InterfaceDeclarationStructure;
    getClassStatements: (context: SdkContext) => ts.Statement[];
}
