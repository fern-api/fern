import { assertNever } from "@fern-api/commons";
import {
    EncodeMethod,
    Encoder,
    FileBasedEncoder,
    InlineEncoder,
    ts,
    VariableReference,
} from "@fern-typescript/helper-utils";
import { SourceFile } from "ts-morph";
import { generateEncoderReference } from "../../../utils/generateEncoderReference";

export function generateEncoderCall({
    encoder,
    variableReference,
    method,
    referencedIn,
}: {
    encoder: Encoder;
    variableReference: VariableReference;
    method: EncodeMethod;

    referencedIn: SourceFile;
}): ts.Expression {
    switch (encoder._type) {
        case "fileBased":
            return generateFileBasedEncoderCall({
                encoder,
                variableReference,
                method,
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
}: {
    encoder: FileBasedEncoder;
    variableReference: VariableReference;
    method: EncodeMethod;

    referencedIn: SourceFile;
}) {
    const referenceToEncoder = generateEncoderReference({
        encoder,
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
