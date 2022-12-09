import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { BaseGeneratedType } from "./BaseGeneratedType";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedUnionType<Context> extends BaseGeneratedType<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
}
