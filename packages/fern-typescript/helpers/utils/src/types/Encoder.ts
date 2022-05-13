import { IntermediateRepresentation } from "@fern-api/api";
import { Directory, ts } from "ts-morph";
import { VariableReference } from "./VariableReference";

export type Encoding = string;

export type EncodeMethod = "encode" | "decode";

// Encoders handle both the encoding and decoding (serialization and
// deserialization).
export type Encoder = InlineEncoder | FileBasedEncoder;

export interface InlineEncoder extends BaseEncoder {
    _type: "inline";
    contentType: string;
    generateEncode: (args: InlineEncoder.generateEncode.Args) => ts.Expression;
    generateDecode: (args: InlineEncoder.generateDecode.Args) => ts.Expression;
}

export declare namespace InlineEncoder {
    namespace generateEncode {
        interface Args {
            referenceToDecodedObject: VariableReference;
            ts: typeof ts;
        }
    }

    namespace generateDecode {
        interface Args {
            referenceToEncodedBuffer: VariableReference;
            ts: typeof ts;
        }
    }
}

export interface FileBasedEncoder extends BaseEncoder {
    _type: "fileBased";
    name: string;
    writeEncoder: (args: FileBasedEncoder.writeEncoder.Args) => void;
    generateEncode: (args: FileBasedEncoder.generateEncode.Args) => ts.Expression;
    generateDecode: (args: FileBasedEncoder.generateDecode.Args) => ts.Expression;
}

export declare namespace FileBasedEncoder {
    namespace generateEncode {
        interface Args {
            referenceToEncoder: ts.Expression;
            referenceToDecodedObject: VariableReference;
            ts: typeof ts;
        }
    }

    namespace generateDecode {
        interface Args {
            referenceToEncoder: ts.Expression;
            referenceToEncodedBuffer: VariableReference;
            ts: typeof ts;
        }
    }

    namespace writeEncoder {
        interface Args {
            // the encoder can write files in this directory.  a file should
            // export the encoder, which should have the name specified in
            // FileBasedEncoder
            encoderDirectory: Directory;
            modelDirectory: Directory;
            intermediateRepresentation: IntermediateRepresentation;
        }
    }
}

export interface BaseEncoder {
    contentType: string;
}
