import { FieldDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Type, TypeReference, UndiscriminatedUnionMember, TypeId, ObjectProperty } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";
import { EnumOrMessageConverter } from "./EnumOrMessageConverter";
import { UndiscriminatedUnionType } from "@fern-api/ir-sdk/lib/sdk/api/resources/dynamic/resources/types/types";
export declare namespace OneOfFieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        oneOfFields: FieldDescriptorProto[];
    }

    export interface Output {
        type: Type;
        referencedTypes: Set<string>;
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


        const unionTypes: UndiscriminatedUnionType[] = []


        return undefined;
    }
}
