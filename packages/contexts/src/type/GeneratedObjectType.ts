import { TypeReference } from "@fern-fern/ir-model/types";
import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getAllPropertiesIncludingExtensions: (
        context: Context
    ) => { wireKey: string; propertyKey: string; type: TypeReference }[];
    getPropertyKey: (args: { propertyWireKey: string }) => string;
}
