import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getAllPropertiesIncludingExtensions: (
        context: Context
    ) => { wireKey: string; propertyKey: string; type: TypeReference }[];
    getPropertyKey: (args: { propertyWireKey: string }) => string;
    buildExampleProperties: (
        example: ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ) => ts.ObjectLiteralElementLike[];
}
