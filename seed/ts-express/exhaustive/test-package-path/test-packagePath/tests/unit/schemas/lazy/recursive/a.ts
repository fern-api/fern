import { object } from "../../../../../../../src/test-packagePath/core/schemas/builders/object";
import { schemaB } from "./b";

// @ts-expect-error
export const schemaA = object({
    b: schemaB,
});
