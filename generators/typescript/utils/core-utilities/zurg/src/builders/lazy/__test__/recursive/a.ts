import { object } from "../../../object";
import { schemaB } from "./b";

// @ts-expect-error
export const schemaA = object({
    b: schemaB
});
