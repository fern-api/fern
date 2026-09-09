import { FernIr } from "@fern-fern/ir-sdk";

import { BaseGeneratedType } from "./BaseGeneratedType.js";

export interface GeneratedUndiscriminatedUnionType<Context> extends BaseGeneratedType<Context> {
    type: "undiscriminatedUnion";
    getBasePropertyKey: (args: { propertyWireKey: string }) => string;
    appliesBasePropertiesToMember: (context: Context, member: FernIr.UndiscriminatedUnionMember) => boolean;
}
