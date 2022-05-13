import { assertNever } from "@fern-api/commons";
import {
    EncodeMethod,
    Encoder,
    FileBasedEncoder,
    InlineEncoder,
    VariableReference,
} from "@fern-typescript/helper-utils";
import { ts } from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateEncoderCall({
    encoder,
    variableReference,
    method,
}: {
    encoder: Encoder;
    variableReference: VariableReference;
    method: EncodeMethod;
}): ts.Expression {
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
    const referenceToEncoder = ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(ClientConstants.Service.NamespaceImports.ENCODERS),
        encoder.name
    );

    switch (method) {
        case "encode":
            return encoder.generateEncode({
                referenceToDecodedObject: variableReference,
                referenceToEncoder,
                ts,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
                referenceToEncoder,
                ts,
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
                ts,
            });
        case "decode":
            return encoder.generateDecode({
                referenceToEncodedBuffer: variableReference,
                ts,
            });
        default:
            assertNever(method);
    }
}
