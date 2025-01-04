import { GetReferenceOpts } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";

import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getAllPropertiesIncludingExtensions: (
        context: Context
    ) => { wireKey: string; propertyKey: string; type: TypeReference }[];
    generateInterface(context: Context): InterfaceDeclarationStructure;
    generateProperties(context: Context): PropertySignatureStructure[];
    getPropertyKey: (args: { propertyWireKey: string }) => string;
    buildExampleProperties: (
        example: ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ) => ts.ObjectLiteralElementLike[];
}
