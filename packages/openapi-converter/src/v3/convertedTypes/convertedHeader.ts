import { RawSchemas } from "@fern-api/yaml-schema";

export interface ConvertedHeader {
    paramType: "header";
    wireKey: string;
    type: string;
    docs: string | undefined;
}

export function getHttpHeaderSchema(convertedHeader: ConvertedHeader): RawSchemas.HttpHeaderSchema {
    if (convertedHeader.docs == null) {
        return convertedHeader.type;
    }
    return {
        type: convertedHeader.type,
        docs: convertedHeader.docs,
    };
}
