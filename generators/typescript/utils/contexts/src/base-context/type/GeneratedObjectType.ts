import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getAllPropertiesIncludingExtensions: (
        context: Context,
        { forceCamelCase }?: { forceCamelCase?: boolean }
    ) => { wireKey: string; propertyKey: string; type: TypeReference }[];
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
        example: ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ) => ts.ObjectLiteralElementLike[];
}
