import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedUnionType<Context> extends BaseGenerated<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
}
