import { FernIr } from "@fern-fern/ir-sdk";
import { InterfaceDeclarationStructure, OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { FileContext } from "../file-context/FileContext.js";

export interface ChannelSignature {
    parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedWebsocketImplementation {
    channel: FernIr.WebSocketChannel;
    getSignature: (context: FileContext) => ChannelSignature;
    getModuleStatement: (context: FileContext) => InterfaceDeclarationStructure;
    getClassStatements: (context: FileContext) => ts.Statement[];
}
