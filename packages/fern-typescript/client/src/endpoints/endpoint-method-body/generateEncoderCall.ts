import { assertNever } from "@fern-api/commons";
import {
    EncodeMethod,
    Encoder,
    FileBasedEncoder,
    InlineEncoder,
    VariableReference,
} from "@fern-typescript/helper-utils";
import * as tsMorph from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateEncoderCall({
    encoder,
    variableReference,
    method,
}: {
    encoder: Encoder;
    variableReference: VariableReference;
    method: EncodeMethod;
}): tsMorph.ts.Expression {
    switch (encoder._type) {
        case "fileBased":
            return generateFileBasedEncoderCall({ encoder, variableReference, method });
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
}: {
    encoder: FileBasedEncoder;
    variableReference: VariableReference;
    method: EncodeMethod;
}) {
    const referenceToEncoder = tsMorph.ts.factory.createPropertyAccessExpression(
        tsMorph.ts.factory.createIdentifier(ClientConstants.Service.NamespaceImports.ENCODERS),
        encoder.name
    );

    switch (method) {
        case "encode":
            return encoder.generateEncode({
                referenceToDecodedObject: variableReference,
                referenceToEncoder,
                tsMorph,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
                referenceToEncoder,
                tsMorph,
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
                tsMorph,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
                tsMorph,
            });
        default:
            assertNever(method);
    }
}
