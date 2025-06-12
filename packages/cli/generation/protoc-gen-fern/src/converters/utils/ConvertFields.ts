import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ObjectProperty, Type, TypeId } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v2-importer-commons";

import { EnumOrMessageConverter } from "../message/EnumOrMessageConverter";
import { FieldConverter } from "../message/FieldConverter";

export function convertFields({
    fields,
    breadcrumbs,
    context
}: {
    fields: FieldDescriptorProto[];
    breadcrumbs: string[];
    context: AbstractConverterContext<object>;
}): {
    convertedFields: ObjectProperty[];
    inlinedTypesFromFields: Record<TypeId, EnumOrMessageConverter.ConvertedSchema>;
    referencedTypes: Set<string>;
    propertiesByAudience: Record<string, Set<string>>;
} {
    const convertedFields: ObjectProperty[] = [];
    let inlinedTypesFromFields: Record<TypeId, EnumOrMessageConverter.ConvertedSchema> = {};
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
            inlinedTypesFromFields = {
                ...inlinedTypesFromFields,
                ...convertedField.inlinedTypes
            };
        }

        // const fieldBreadcrumbs = [...breadcrumbs, "fields", field.name];

        // // TODO: support arrays
        // const isRepeated = field.label === 3;

        // const isReferencedType = field.type === 11 && field.typeName != null;
        // context.logger.info(`Converting ${isRepeated ? "repeated ": ""}${isReferencedType ? "type reference " : "field "}'${field.name}' at ${fieldBreadcrumbs.join(".")}`);
    }

    return {
        convertedFields,
        inlinedTypesFromFields,
        referencedTypes,
        propertiesByAudience
    };
}
