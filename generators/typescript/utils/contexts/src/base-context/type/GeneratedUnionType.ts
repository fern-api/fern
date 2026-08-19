import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedUnion } from "../../commons/GeneratedUnion.js";
import { BaseGeneratedType } from "./BaseGeneratedType.js";

export interface GeneratedUnionType<Context> extends BaseGeneratedType<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: FernIr.SingleUnionTypeProperty): string;
}
