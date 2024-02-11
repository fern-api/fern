import { BaseGeneratedTypeSchema } from "./BaseGeneratedTypeSchema";

export interface GeneratedAliasTypeSchema<Context> extends BaseGeneratedTypeSchema<Context> {
    type: "alias";
}
