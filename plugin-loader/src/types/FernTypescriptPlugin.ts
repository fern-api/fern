import ts from "typescript";

export interface FernTypescriptPlugin {
    encodings?: Record<FernTypescriptPlugin.Encodings.Encoding, FernTypescriptPlugin.Encodings.EncodingHandlers>;
}

export declare namespace FernTypescriptPlugin {
    namespace Encodings {
        type Encoding = string;

        interface EncodingHandlers {
            generateEncode: (args: EncodingHandlers.generateEncode.Args) => ts.Expression;
            generateDecode: (args: EncodingHandlers.generateDecode.Args) => ts.Expression;
        }

        namespace EncodingHandlers {
            namespace generateEncode {
                interface Args {
                    typeReference: ts.Expression;
                }
            }

            namespace generateDecode {
                interface Args {
                    typeReference: ts.Expression;
                }
            }
        }
    }
}
