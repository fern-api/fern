import { SchemaOptions } from "@fern-typescript/zurg";

export function getSchemaOptions({ allowExtraFields }: { allowExtraFields: boolean }): Required<SchemaOptions> {
    return {
        unrecognizedObjectKeys: allowExtraFields ? "passthrough" : "strip",
        allowUnrecognizedUnionMembers: allowExtraFields,
        allowUnrecognizedEnumValues: allowExtraFields,
        skipValidation: false,
        breadcrumbsPrefix: []
    };
}
