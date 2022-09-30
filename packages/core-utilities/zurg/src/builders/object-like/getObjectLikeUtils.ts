import { BaseObjectLikeSchema, ObjectLikeUtils } from "./types";
import { withProperties } from "./withProperties";

export function getObjectLikeUtils<Raw, Parsed>(
    schema: BaseObjectLikeSchema<Raw, Parsed>
): ObjectLikeUtils<Raw, Parsed> {
    return {
        withProperties: (properties) => withProperties(schema, properties),
    };
}
