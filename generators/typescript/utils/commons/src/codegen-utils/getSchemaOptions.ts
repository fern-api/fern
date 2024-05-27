import { SchemaOptions } from "@fern-typescript/zurg";

export function getSchemaOptions({
    allowExtraFields,
    skipValidation
}: {
    allowExtraFields: boolean;
    skipValidation?: boolean;
}): Required<SchemaOptions> {
    return {
        unrecognizedObjectKeys: allowExtraFields ? "passthrough" : "strip",
        allowUnrecognizedUnionMembers: allowExtraFields,
        allowUnrecognizedEnumValues: allowExtraFields,
        skipValidation: skipValidation ?? false,
        breadcrumbsPrefix: []
    };
}
