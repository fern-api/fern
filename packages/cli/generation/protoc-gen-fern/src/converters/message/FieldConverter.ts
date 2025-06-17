import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Availability, TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { PRIMITIVE_TYPES } from "../../commons/ProtobufSettings";
import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { ArrayFieldConverter } from "./ArrayFieldConverter";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { PrimitiveFieldConverter } from "./PrimitiveFieldConverter";

export declare namespace FieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        field: FieldDescriptorProto;
    }

    export interface Output {
        type: TypeReference;
        inlinedTypes: Record<string, EnumOrMessageConverter.ConvertedSchema>;
        availability?: Availability;
    }
}

export class FieldConverter extends AbstractConverter<ProtofileConverterContext, FieldConverter.Output> {
    private readonly field: FieldDescriptorProto;

    constructor({ context, breadcrumbs, field }: FieldConverter.Args) {
        super({ context, breadcrumbs });
        this.field = field;
    }

    public convert(): FieldConverter.Output | undefined {
        const isRepeated = this.field.label === 3;

        if (isRepeated) {
            const arrayFieldConverter = new ArrayFieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: this.field
            });
            const convertedArrayField = arrayFieldConverter.convert();
            if (convertedArrayField != null) {
                return {
                    type: convertedArrayField.typeReference,
                    inlinedTypes: convertedArrayField.inlinedTypes
                };
            }
        }

        if (PRIMITIVE_TYPES.has(this.field.type)) {
            const primitiveFieldConverter = new PrimitiveFieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: this.field
            });
            const convertedType = primitiveFieldConverter.convert();
            if (convertedType != null) {
                return {
                    type: convertedType,
                    inlinedTypes: {}
                };
            }
        }

        if (this.field.type === 11 && this.field.typeName != null) {
            const typeReference = this.context.convertGrpcReferenceToTypeReference({
                typeName: this.context.maybeRemoveGrpcPackagePrefix(this.field.typeName),
                displayNameOverride: this.field.name
            });
            if (typeReference.ok) {
                return {
                    type: typeReference.reference,
                    inlinedTypes: {}
                };
            }
        }

        return undefined;
    }
}
