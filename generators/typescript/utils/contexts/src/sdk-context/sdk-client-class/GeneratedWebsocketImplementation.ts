import { FernIr } from "@fern-fern/ir-sdk";
import {
    InterfaceDeclarationStructure,
    OptionalKind,
    ParameterDeclarationStructure,
    TypeAliasDeclarationStructure,
    ts
} from "ts-morph";

import { SdkContext } from "../SdkContext.js";

export interface ChannelSignature {
    parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    returnTypeWithoutPromise: ts.TypeNode;
}

export interface GeneratedWebsocketImplementation {
    channel: FernIr.WebSocketChannel;
    getSignature: (context: SdkContext) => ChannelSignature;
    getModuleStatements: (context: SdkContext) => (InterfaceDeclarationStructure | TypeAliasDeclarationStructure)[];
    getClassStatements: (context: SdkContext) => ts.Statement[];
}
