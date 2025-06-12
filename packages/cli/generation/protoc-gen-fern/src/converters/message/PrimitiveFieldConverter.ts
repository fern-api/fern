import { FieldDescriptorProto, FieldDescriptorProto_Type } from "@bufbuild/protobuf/wkt";

import {
    ContainerType,
    IntegerValidationRules,
    Literal,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    StringValidationRules,
    TypeReference
} from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v2-importer-commons";

export declare namespace PrimitiveFieldConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        field: FieldDescriptorProto;
    }
}

export class PrimitiveFieldConverter extends AbstractConverter<AbstractConverterContext<object>, TypeReference> {
    private readonly field: FieldDescriptorProto;

    constructor({ context, breadcrumbs, field }: PrimitiveFieldConverter.Args) {
        super({ context, breadcrumbs });
        this.field = field;
    }

    public convert(): TypeReference | undefined {
        switch (this.field.type) {
            case FieldDescriptorProto_Type.STRING: {
                return TypeReference.primitive({
                    v1: "STRING",
                    v2: PrimitiveTypeV2.string({
                        default: "",
                        validation: undefined
                    })
                });
            }
            case FieldDescriptorProto_Type.DOUBLE: {
                return TypeReference.primitive({
                    v1: "DOUBLE",
                    v2: PrimitiveTypeV2.double({
                        default: 0.0,
                        validation: undefined
                    })
                });
            }
            case FieldDescriptorProto_Type.FLOAT: {
                return TypeReference.primitive({
                    v1: "FLOAT",
                    v2: PrimitiveTypeV2.float({
                        default: 0.0
                    })
                });
            }
            case FieldDescriptorProto_Type.INT32: {
                return TypeReference.primitive({
                    v1: "INTEGER",
                    v2: PrimitiveTypeV2.integer({
                        default: 0,
                        validation: undefined
                    })
                });
            }
            case FieldDescriptorProto_Type.INT64: {
                return TypeReference.primitive({
                    v1: "LONG",
                    v2: PrimitiveTypeV2.long({
                        default: 0
                    })
                });
            }
            case FieldDescriptorProto_Type.UINT32: {
                return TypeReference.primitive({
                    v1: "UINT",
                    v2: PrimitiveTypeV2.uint({})
                });
            }
            case FieldDescriptorProto_Type.UINT64: {
                return TypeReference.primitive({
                    v1: "UINT_64",
                    v2: PrimitiveTypeV2.uint64({})
                });
            }
            case FieldDescriptorProto_Type.BOOL: {
                return TypeReference.primitive({
                    v1: "BOOLEAN",
                    v2: PrimitiveTypeV2.boolean({
                        default: false
                    })
                });
            }
            default:
                return undefined;
        }
    }
}
