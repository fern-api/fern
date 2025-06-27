import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { ObjectProperty, Type, TypeId, TypeReference, UndiscriminatedUnionMember } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { FieldConverter } from "./FieldConverter";

export declare namespace OneOfFieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        oneOfFields: FieldDescriptorProto[];
    }

    export interface Output {
        type: Type;
        referencedTypes: Set<TypeId>;
        inlinedTypes: Record<TypeId, EnumOrMessageConverter.ConvertedSchema>;
    }
}

export class OneOfFieldConverter extends AbstractConverter<ProtofileConverterContext, OneOfFieldConverter.Output> {
    private readonly oneOfFields: FieldDescriptorProto[];

    constructor({ context, breadcrumbs, oneOfFields }: OneOfFieldConverter.Args) {
        super({ context, breadcrumbs });
        this.oneOfFields = oneOfFields;
    }

    public convert(): OneOfFieldConverter.Output | undefined {
        const unionTypes: UndiscriminatedUnionMember[] = [];

        for (const oneOfField of this.oneOfFields) {
            // Step 1: if it is a primitive/non-object, add it to the union types inline
            // Step 2: if it is an object/named type, convert it to a type reference and add the original type as an inlined type
            const fieldConverter = new FieldConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                field: oneOfField,
                wrapAsOptional: false
            });
            const field = fieldConverter.convert();
            if (field != null) {
                unionTypes.push({
                    type: field.type,
                    docs: undefined
                });
            }
        }

        return {
            type: Type.undiscriminatedUnion({
                members: unionTypes
            }),
            referencedTypes: new Set<TypeId>(),
            inlinedTypes: {}
        };
    }
}
