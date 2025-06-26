import { object } from "../../../../../../../src/test-packagePath/core/schemas/builders/object";
import { optional } from "../../../../../../../src/test-packagePath/core/schemas/builders/schema-utils";
import { schemaA } from "./a";

// @ts-expect-error
export const schemaB = object({
    a: optional(schemaA),
});
