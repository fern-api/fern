import { assertNever } from "@fern-api/commons";
import {
    EncodeMethod,
    Encoder,
    FileBasedEncoder,
    InlineEncoder,
    ts,
    VariableReference,
} from "@fern-typescript/helper-utils";
import { ClientConstants } from "../../../constants";

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
        ts.factory.createIdentifier(ClientConstants.HttpService.NamespaceImports.ENCODERS),
        encoder.name
    );

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
