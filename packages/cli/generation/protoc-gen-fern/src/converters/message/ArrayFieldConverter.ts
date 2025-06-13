import { FieldDescriptorProto, FieldDescriptorProto_Label } from "@bufbuild/protobuf/wkt";

import { ContainerType, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { FieldConverter } from "./FieldConverter";

export declare namespace ArrayFieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        field: FieldDescriptorProto;
    }

    export interface Output {
        typeReference: TypeReference;
        referencedTypes: Set<string>;
        inlinedTypes: Record<TypeId, EnumOrMessageConverter.ConvertedSchema>;
    }
}

export class ArrayFieldConverter extends AbstractConverter<ProtofileConverterContext, ArrayFieldConverter.Output> {
    private static LIST_UNKNOWN = TypeReference.container(ContainerType.list(TypeReference.unknown()));

    private readonly field: FieldDescriptorProto;

    constructor({ context, breadcrumbs, field }: ArrayFieldConverter.Args) {
        super({ context, breadcrumbs });
        this.field = field;
    }

    public convert(): ArrayFieldConverter.Output | undefined {
        if (this.field.label === 3) {
            const fieldConverter = new FieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: {
                    ...this.field,
                    // set to optional to avoid infinite recursion
                    label: FieldDescriptorProto_Label.OPTIONAL
                }
            });
            const convertedField = fieldConverter.convert();
            if (convertedField != null) {
                const referencedTypes = new Set<string>();
                return {
                    typeReference: TypeReference.container(ContainerType.list(convertedField.type)),
                    referencedTypes,
                    inlinedTypes: convertedField.inlinedTypes
                };
            }
        }
        return { typeReference: ArrayFieldConverter.LIST_UNKNOWN, referencedTypes: new Set(), inlinedTypes: {} };
    }
}
