import { assertNever } from "@fern-api/commons";
import {
    EncodeMethod,
    Encoder,
    FileBasedEncoder,
    InlineEncoder,
    ts,
    VariableReference,
} from "@fern-typescript/helper-utils";
import { Directory, SourceFile } from "ts-morph";
import { generateEncoderReference } from "../../../utils/generateEncoderReference";

export function generateEncoderCall({
    encoder,
    variableReference,
    method,
    encodersDirectory,
    referencedIn,
}: {
    encoder: Encoder;
    variableReference: VariableReference;
    method: EncodeMethod;
    encodersDirectory: Directory;
    referencedIn: SourceFile;
}): ts.Expression {
    switch (encoder._type) {
        case "fileBased":
            return generateFileBasedEncoderCall({
                encoder,
                variableReference,
                method,
                encodersDirectory,
                referencedIn,
            });
        case "inline":
            return generateInlineEncoderCall({ encoder, variableReference, method });
        default:
            assertNever(encoder);
    }
}

function generateFileBasedEncoderCall({
    encoder,
    variableReference,
    method,
    referencedIn,
    encodersDirectory,
}: {
    encoder: FileBasedEncoder;
    variableReference: VariableReference;
    method: EncodeMethod;
    encodersDirectory: Directory;
    referencedIn: SourceFile;
}) {
    const referenceToEncoder = generateEncoderReference({
        encoder,
        encodersDirectory,
        referencedIn,
    });

    switch (method) {
        case "encode":
            return encoder.generateEncode({
                referenceToDecodedObject: variableReference,
                referenceToEncoder,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
                referenceToEncoder,
            });
        default:
            assertNever(method);
    }
}

function generateInlineEncoderCall({
    encoder,
    variableReference,
    method,
}: {
    encoder: InlineEncoder;
    variableReference: VariableReference;
    method: EncodeMethod;
}) {
    switch (method) {
        case "encode":
            return encoder.generateEncode({
                referenceToDecodedObject: variableReference,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
            });
        default:
            assertNever(method);
    }
}
