import { FieldDescriptorProto_Type, OneofDescriptorProto } from "@bufbuild/protobuf/wkt";

import { Type, TypeReference, UndiscriminatedUnionMember } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { ProtofileConverterContext } from "../ProtofileConverterContext";

export declare namespace OneOfFieldConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        oneOfFieldProperties: TypeReference[];
    }
}

export class OneOfFieldConverter extends AbstractConverter<ProtofileConverterContext, TypeReference> {
    private readonly oneOfFieldProperties: TypeReference[];

    constructor({ context, breadcrumbs, oneOfFieldProperties }: OneOfFieldConverter.Args) {
        super({ context, breadcrumbs });
        this.oneOfFieldProperties = oneOfFieldProperties;
    }

    public convert(): TypeReference | undefined {
        const referencedTypes: Set<string> = new Set();

        const unionTypes: UndiscriminatedUnionMember[] = this.oneOfFieldProperties.map((oneOfFieldTypeReference) => ({
            type: oneOfFieldTypeReference,
            docs: undefined
        }));

        return undefined;
    }
}
