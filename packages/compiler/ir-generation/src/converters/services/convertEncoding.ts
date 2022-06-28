import { CustomWireMessageEncoding, Encoding } from "@fern-fern/ir-model/services/commons";

const DEFAULT_ENCODING = Encoding.json();

export function convertEncoding({
    rawEncoding,
    nonStandardEncodings,
}: {
    rawEncoding: string | undefined;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): Encoding {
    if (rawEncoding == null) {
        return DEFAULT_ENCODING;
    }
    switch (rawEncoding) {
        case "json":
            return Encoding.json();
        default: {
            nonStandardEncodings.push({
                encoding: rawEncoding,
            });
            return Encoding.custom({
                encoding: rawEncoding,
            });
        }
    }
}
