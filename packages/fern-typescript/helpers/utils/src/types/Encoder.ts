import { IntermediateRepresentation } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/commons";
import * as tsMorph from "ts-morph";
import { VariableReference } from "./VariableReference";

export type Encoding = string;
export type EncodeMethod = "encode" | "decode";
export const EncodeMethod = {
    Encode: "encode",
    Decode: "decode",
} as const;

// Encoders handle both the encoding and decoding (serialization and
// deserialization).
export type Encoder = InlineEncoder | FileBasedEncoder;

export interface InlineEncoder extends BaseEncoder {
    _type: "inline";
    contentType: string;
    generateEncode: (args: InlineEncoder.generateEncode.Args) => tsMorph.ts.Expression;
    generateDecode: (args: InlineEncoder.generateDecode.Args) => tsMorph.ts.Expression;
}

export declare namespace InlineEncoder {
    namespace generateEncode {
        interface Args {
            referenceToDecodedObject: VariableReference;
            tsMorph: typeof tsMorph;
        }
    }

    namespace generateDecode {
        interface Args {
            referenceToEncodedBuffer: VariableReference;
            tsMorph: typeof tsMorph;
        }
    }
}

export interface FileBasedEncoder extends BaseEncoder {
    _type: "fileBased";
    name: string;
    writeEncoder: (args: FileBasedEncoder.writeEncoder.Args) => void;
    generateEncode: (args: FileBasedEncoder.generateEncode.Args) => tsMorph.ts.Expression;
    generateDecode: (args: FileBasedEncoder.generateDecode.Args) => tsMorph.ts.Expression;
}

export declare namespace FileBasedEncoder {
    namespace generateEncode {
        interface Args {
            referenceToEncoder: tsMorph.ts.Expression;
            referenceToDecodedObject: VariableReference;
            tsMorph: typeof tsMorph;
        }
    }

    namespace generateDecode {
        interface Args {
            referenceToEncoder: tsMorph.ts.Expression;
            referenceToEncodedBuffer: VariableReference;
            tsMorph: typeof tsMorph;
        }
    }

    namespace writeEncoder {
        interface Args {
            // the encoder can write files in this directory.  a file should
            // export the encoder, which should have the name specified in
            // FileBasedEncoder
            encoderDirectory: tsMorph.Directory;
            modelDirectory: tsMorph.Directory;
            intermediateRepresentation: IntermediateRepresentation;
            tsMorph: typeof tsMorph;
            typeResolver: TypeResolver;
        }
    }
}

export interface BaseEncoder {
    contentType: string;
}
