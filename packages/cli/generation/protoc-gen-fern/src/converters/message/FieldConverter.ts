import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Availability, ContainerType, TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { PRIMITIVE_TYPES } from "../../commons/ProtobufSettings";
import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { ArrayFieldConverter } from "./ArrayFieldConverter";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { PrimitiveFieldConverter } from "./PrimitiveFieldConverter";

export declare namespace FieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        field: FieldDescriptorProto;
        wrapAsOptional?: boolean;
        sourceCodeInfoPath: number[];
    }

    export interface Output {
        type: TypeReference;
        inlinedTypes: Record<string, EnumOrMessageConverter.ConvertedSchema>;
        availability?: Availability;
    }
}

export class FieldConverter extends AbstractConverter<ProtofileConverterContext, FieldConverter.Output> {
    private readonly field: FieldDescriptorProto;
    private readonly wrapAsOptional: boolean;
    private readonly sourceCodeInfoPath: number[];

    constructor({ context, breadcrumbs, field, wrapAsOptional, sourceCodeInfoPath }: FieldConverter.Args) {
        super({ context, breadcrumbs });
        this.field = field;
        this.wrapAsOptional = wrapAsOptional ?? true;
        this.sourceCodeInfoPath = sourceCodeInfoPath;
    }

    public convert(): FieldConverter.Output | undefined {
        // TODO: handle maps

        const isRepeated = this.field.label === 3;

        if (isRepeated) {
            const arrayFieldConverter = new ArrayFieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: this.field,
                sourceCodeInfoPath: this.sourceCodeInfoPath
            });
            const convertedArrayField = arrayFieldConverter.convert();
            if (convertedArrayField != null) {
                return {
                    type: this.wrapAsOptional
                        ? this.wrapInOptional(convertedArrayField.typeReference)
                        : convertedArrayField.typeReference,
                    inlinedTypes: convertedArrayField.inlinedTypes
                };
            }
        }

        if (PRIMITIVE_TYPES.has(this.field.type)) {
            const primitiveFieldConverter = new PrimitiveFieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: this.field,
                sourceCodeInfoPath: this.sourceCodeInfoPath
            });
            const convertedType = primitiveFieldConverter.convert();
            if (convertedType != null) {
                return {
                    type: this.wrapAsOptional ? this.wrapInOptional(convertedType) : convertedType,
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
                    type: this.wrapAsOptional ? this.wrapInOptional(typeReference.reference) : typeReference.reference,
                    inlinedTypes: {}
                };
            }
        }

        return undefined;
    }

    private wrapInOptional(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.optional(type));
    }
}
