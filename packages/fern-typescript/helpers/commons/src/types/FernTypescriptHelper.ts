import ts from "typescript";

export interface FernTypescriptHelper {
    encodings?: Record<FernTypescriptHelper.Encodings.Encoding, FernTypescriptHelper.Encodings.EncodingHandlers>;
}

export declare namespace FernTypescriptHelper {
    namespace Encodings {
        type Encoding = string;

        interface EncodingHandlers {
            contentType: string;
            generateEncode: (args: EncodingHandlers.generateEncode.Args) => ts.Expression;
            generateDecode: (args: EncodingHandlers.generateDecode.Args) => ts.Expression;
        }

        namespace EncodingHandlers {
            namespace generateEncode {
                interface Args {
                    referenceToDecoded: ts.Expression;
                }
            }

            namespace generateDecode {
                interface Args {
                    referenceToEncodedBuffer: ts.Expression;
                }
            }
        }
    }
}
