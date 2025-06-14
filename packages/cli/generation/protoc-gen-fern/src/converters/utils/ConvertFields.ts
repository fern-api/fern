import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ObjectProperty, Type, TypeId } from "@fern-api/ir-sdk";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { EnumOrMessageConverter } from "../message/EnumOrMessageConverter";
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
} {
    const convertedFields: ObjectProperty[] = [];
    const propertiesByAudience: Record<string, Set<string>> = {};
    const referencedTypes: Set<string> = new Set();

    for (const field of fields) {
        const fieldConverter = new FieldConverter({
            context,
            breadcrumbs: [...breadcrumbs, "fields", field.name],
            field
        });
        const convertedField = fieldConverter.convert();
        if (convertedField != null) {
            convertedFields.push({
                name: context.casingsGenerator.generateNameAndWireValue({
                    name: field.name,
                    wireValue: field.name
                }),
                valueType: convertedField.type,
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            });
        }
    }

    return {
        convertedFields,
        referencedTypes,
        propertiesByAudience
    };
}
