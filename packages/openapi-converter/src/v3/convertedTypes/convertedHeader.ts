import { HttpHeaderSchema } from "@fern-api/yaml-schema/src/schemas";

export interface ConvertedHeader {
    wireKey: string;
    type: string;
    docs: string | undefined;
}

export function getHttpHeaderSchema(convertedHeader: ConvertedHeader): HttpHeaderSchema {
    if (convertedHeader.docs == null) {
        return convertedHeader.type;
    }
    return {
        type: convertedHeader.type,
        docs: convertedHeader.docs,
    };
}
