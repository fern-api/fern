import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ObjectProperty } from "@fern-api/ir-sdk";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { FieldConverter } from "../message/FieldConverter";

export function convertFields({
    fields,
    breadcrumbs,
    context
}: {
    fields: FieldDescriptorProto[];
    breadcrumbs: string[];
    context: ProtofileConverterContext;
}): {
    convertedFields: ObjectProperty[];
    referencedTypes: Set<string>;
    propertiesByAudience: Record<string, Set<string>>;
    oneOfFields: Record<number, FieldDescriptorProto[]>;
} {
    const convertedFields: ObjectProperty[] = [];
    const propertiesByAudience: Record<string, Set<string>> = {};
    const referencedTypes: Set<string> = new Set();
    const oneOfFields: Record<number, FieldDescriptorProto[]> = {};

    for (const field of fields) {
        const fieldConverter = new FieldConverter({
            context,
            breadcrumbs: [...breadcrumbs, "fields", field.name],
            field
        });
        const convertedField = fieldConverter.convert();
        if (convertedField != null) {
            const convertedFieldObjectProperty: ObjectProperty = {
                name: context.casingsGenerator.generateNameAndWireValue({
                    name: field.name,
                    wireValue: field.name
                }),
                valueType: convertedField.type,
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            };

            // Check if oneofIndex is actually set vs default value of 0
            const hasOneofIndex = Object.prototype.hasOwnProperty.call(field, "oneofIndex");
            if (hasOneofIndex && field.oneofIndex != null) {
                if (oneOfFields[field.oneofIndex] == null) {
                    oneOfFields[field.oneofIndex] = [];
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                oneOfFields[field.oneofIndex]!.push(field);
                continue;
            }

            convertedFields.push(convertedFieldObjectProperty);
        }
    }

    return {
        convertedFields,
        referencedTypes,
        propertiesByAudience,
        oneOfFields
    };
}
