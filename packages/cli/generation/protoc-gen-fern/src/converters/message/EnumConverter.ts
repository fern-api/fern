import { EnumDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Type } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";

export declare namespace EnumConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        enum: EnumDescriptorProto;
    }

    export interface Output {
        type: Type;
    }
}

export class EnumConverter extends AbstractConverter<ProtofileConverterContext, EnumConverter.Output> {
    private readonly enum: EnumDescriptorProto;

    constructor({ context, breadcrumbs, enum: enumType }: EnumConverter.Args) {
        super({ context, breadcrumbs });
        this.enum = enumType;
    }

    public convert(): EnumConverter.Output | undefined {
        const values = this.enum.value.map((value) => {
            const name = value.name;
            return {
                name: this.context.casingsGenerator.generateNameAndWireValue({
                    name,
                    wireValue: name
                }),
                docs: undefined,
                availability: undefined,
                casing: undefined
            };
        });

        return {
            type: Type.enum({
                default: undefined,
                values
            })
        };
    }
}
