import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

import { BaseGeneratedType } from "./BaseGeneratedType.js";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getAllPropertiesIncludingExtensions: (
        context: Context,
        { forceCamelCase }?: { forceCamelCase?: boolean }
    ) => { wireKey: string; propertyKey: string; type: FernIr.TypeReference }[];
    generateInterface(context: Context): InterfaceDeclarationStructure;
    generateProperties(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[];
    getPropertyKey: (args: { propertyWireKey: string }) => string;
    buildExampleProperties: (
        example: FernIr.ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ) => ts.ObjectLiteralElementLike[];
}
