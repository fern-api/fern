import { SingleUnionTypeProperty } from "@fern-fern/ir-sdk/api";

import { GeneratedUnion } from "../../commons/GeneratedUnion";
import { BaseGeneratedType } from "./BaseGeneratedType";

export interface GeneratedUnionType<Context> extends BaseGeneratedType<Context> {
    type: "union";
    getGeneratedUnion: () => GeneratedUnion<Context>;
    getSinglePropertyKey(singleProperty: SingleUnionTypeProperty): string;
}
