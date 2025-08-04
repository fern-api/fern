import { EnumDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Type } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { PATH_FIELD_NUMBERS } from "../utils/PathFieldNumbers";

export declare namespace EnumConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        enum: EnumDescriptorProto;
        sourceCodeInfoPath: number[];
    }

    export interface Output {
        type: Type;
    }
}

export class EnumConverter extends AbstractConverter<ProtofileConverterContext, EnumConverter.Output> {
    private readonly enum: EnumDescriptorProto;
    private readonly sourceCodeInfoPath: number[];
    constructor({ context, breadcrumbs, enum: enumType, sourceCodeInfoPath }: EnumConverter.Args) {
        super({ context, breadcrumbs });
        this.enum = enumType;
        this.sourceCodeInfoPath = sourceCodeInfoPath;
    }

    public convert(): EnumConverter.Output | undefined {
        const values = this.enum.value.map((value, index) => {
            const name = value.name;
            return {
                name: {
                    name: this.context.casingsGenerator.generateName(name),
                    wireValue: name
                },
                docs: this.context.getCommentForPath([
                    ...this.sourceCodeInfoPath,
                    PATH_FIELD_NUMBERS.ENUM.VALUE,
                    index
                ]),
                availability: undefined
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
