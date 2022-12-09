import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedObjectType<Context> extends BaseGeneratedType<Context> {
    type: "object";
    getPropertyKey: (args: { propertyWireKey: string }) => string;
}
