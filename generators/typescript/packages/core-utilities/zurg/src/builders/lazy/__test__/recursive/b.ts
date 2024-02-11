import { object } from "../../../object";
import { optional } from "../../../schema-utils";
import { schemaA } from "./a";

// @ts-expect-error
export const schemaB = object({
    a: optional(schemaA),
});
