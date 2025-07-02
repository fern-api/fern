import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ObjectProperty, TypeId } from "@fern-api/ir-sdk";

import { PATH_FIELD_NUMBERS } from "./PathFieldNumbers";
import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { FieldConverter } from "../message/FieldConverter";

export function convertFields({
    fields,
    breadcrumbs,
    context,
    sourceCodeInfoPath
}: {
    fields: FieldDescriptorProto[];
    breadcrumbs: string[];
    context: ProtofileConverterContext;
    sourceCodeInfoPath: number[];
}): {
    convertedFields: ObjectProperty[];
    referencedTypes: Set<TypeId>;
    propertiesByAudience: Record<string, Set<string>>;
    oneOfFields: Record<number, FieldDescriptorProto[]>;
} {
    const convertedFields: ObjectProperty[] = [];
    const propertiesByAudience: Record<string, Set<string>> = {};
    const referencedTypes: Set<TypeId> = new Set();
    const oneOfFields: Record<number, FieldDescriptorProto[]> = {};

    for (const [index, field] of fields.entries()) {
        const fieldConverter = new FieldConverter({
            context,
            breadcrumbs: [...breadcrumbs, "fields", field.name],
            field,
            sourceCodeInfoPath: [...sourceCodeInfoPath, 2, index]
        });
        const convertedField = fieldConverter.convert();
        if (convertedField != null) {
            const convertedFieldObjectProperty: ObjectProperty = {
                name: context.casingsGenerator.generateNameAndWireValue({
                    name: field.name,
                    wireValue: field.name
                }),
                valueType: convertedField.type,
                docs: context.getCommentForPath([...sourceCodeInfoPath, 2, index]),
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
