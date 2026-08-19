import { SchemaOptions } from "../core-utilities/Zurg.js";

export function getSchemaOptions({
    allowExtraFields,
    skipValidation,
    omitUndefined
}: {
    allowExtraFields: boolean;
    omitUndefined: boolean;
    skipValidation?: boolean;
}): Required<SchemaOptions> {
    return {
        unrecognizedObjectKeys: allowExtraFields ? "passthrough" : "strip",
        allowUnrecognizedUnionMembers: allowExtraFields,
        allowUnrecognizedEnumValues: allowExtraFields,
        skipValidation: skipValidation ?? false,
        breadcrumbsPrefix: [],
        omitUndefined
    };
}
