import { object } from "../../../builders/object";
import { optional } from "../../../builders/schema-utils";
import { schemaA } from "./a";

// @ts-expect-error
export const schemaB = object({
    a: optional(schemaA)
});
