import { finalIr } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

interface WebhookTimestampExtensionSchema {
    header: string;
    format?: "unix-seconds" | "unix-millis" | "iso8601";
    tolerance?: number;
}

interface WebhookPayloadFormatExtensionSchema {
    components: Array<"body" | "timestamp" | "notification-url" | "message-id">;
    delimiter?: string;
}

interface WebhookSignatureExtensionSchema {
    type: "hmac" | "asymmetric";
    header: string;
    // HMAC fields
    algorithm?: "sha256" | "sha1" | "sha384" | "sha512";
    encoding?: "base64" | "hex";
    "signature-prefix"?: string;
    "payload-format"?: WebhookPayloadFormatExtensionSchema;
    timestamp?: WebhookTimestampExtensionSchema;
    // Asymmetric fields
    "asymmetric-algorithm"?: string;
    "jwks-url"?: string;
    "key-id-header"?: string;
}

function convertTimestamp(
    timestamp: WebhookTimestampExtensionSchema | undefined
): finalIr.WebhookTimestamp | undefined {
    if (timestamp == null) {
        return undefined;
    }
    let format: finalIr.WebhookTimestampFormat | undefined;
    if (timestamp.format != null) {
        switch (timestamp.format) {
            case "unix-seconds":
                format = finalIr.WebhookTimestampFormat.UnixSeconds;
                break;
            case "unix-millis":
                format = finalIr.WebhookTimestampFormat.UnixMillis;
                break;
            case "iso8601":
                format = finalIr.WebhookTimestampFormat.Iso8601;
                break;
        }
    }
    return {
        header: timestamp.header,
        format,
        tolerance: timestamp.tolerance
    };
}

function convertPayloadFormat(
    payloadFormat: WebhookPayloadFormatExtensionSchema | undefined
): finalIr.WebhookPayloadFormat | undefined {
    if (payloadFormat == null) {
        return undefined;
    }
    return {
        components: payloadFormat.components.map((component) => {
            switch (component) {
                case "body":
                    return finalIr.WebhookPayloadComponent.Body;
                case "timestamp":
                    return finalIr.WebhookPayloadComponent.Timestamp;
                case "notification-url":
                    return finalIr.WebhookPayloadComponent.NotificationUrl;
                case "message-id":
                    return finalIr.WebhookPayloadComponent.MessageId;
            }
        }),
        delimiter: payloadFormat.delimiter
    };
}

function convertAlgorithm(
    algorithm: "sha256" | "sha1" | "sha384" | "sha512" | undefined
): finalIr.WebhookSignatureAlgorithm | undefined {
    if (algorithm == null) {
        return undefined;
    }
    switch (algorithm) {
        case "sha256":
            return finalIr.WebhookSignatureAlgorithm.Sha256;
        case "sha1":
            return finalIr.WebhookSignatureAlgorithm.Sha1;
        case "sha384":
            return finalIr.WebhookSignatureAlgorithm.Sha384;
        case "sha512":
            return finalIr.WebhookSignatureAlgorithm.Sha512;
    }
}

function convertEncoding(
    encoding: "base64" | "hex" | undefined
): finalIr.WebhookSignatureEncoding | undefined {
    if (encoding == null) {
        return undefined;
    }
    switch (encoding) {
        case "base64":
            return finalIr.WebhookSignatureEncoding.Base64;
        case "hex":
            return finalIr.WebhookSignatureEncoding.Hex;
    }
}

function convertAsymmetricAlgorithm(
    algorithm: string | undefined
): finalIr.AsymmetricAlgorithm | undefined {
    if (algorithm == null) {
        return undefined;
    }
    switch (algorithm) {
        case "rsa-sha256":
            return finalIr.AsymmetricAlgorithm.RsaSha256;
        case "rsa-sha384":
            return finalIr.AsymmetricAlgorithm.RsaSha384;
        case "rsa-sha512":
            return finalIr.AsymmetricAlgorithm.RsaSha512;
        case "ecdsa-sha256":
            return finalIr.AsymmetricAlgorithm.EcdsaSha256;
        case "ecdsa-sha384":
            return finalIr.AsymmetricAlgorithm.EcdsaSha384;
        case "ecdsa-sha512":
            return finalIr.AsymmetricAlgorithm.EcdsaSha512;
        case "ed25519":
            return finalIr.AsymmetricAlgorithm.Ed25519;
        default:
            return undefined;
    }
}

function convertSignatureSchema(
    extension: WebhookSignatureExtensionSchema
): finalIr.WebhookSignatureVerification | undefined {
    if (extension.type === "hmac") {
        return finalIr.WebhookSignatureVerification.hmac({
            header: extension.header,
            algorithm: convertAlgorithm(extension.algorithm),
            encoding: convertEncoding(extension.encoding),
            signaturePrefix: extension["signature-prefix"],
            payloadFormat: convertPayloadFormat(extension["payload-format"]),
            timestamp: convertTimestamp(extension.timestamp)
        });
    }

    if (extension.type === "asymmetric") {
        const asymmetricAlgorithm = convertAsymmetricAlgorithm(extension["asymmetric-algorithm"]);
        if (asymmetricAlgorithm == null) {
            return undefined;
        }
        return finalIr.WebhookSignatureVerification.asymmetric({
            header: extension.header,
            asymmetricAlgorithm,
            encoding: convertEncoding(extension.encoding),
            signaturePrefix: extension["signature-prefix"],
            jwksUrl: extension["jwks-url"],
            keyIdHeader: extension["key-id-header"],
            timestamp: convertTimestamp(extension.timestamp)
        });
    }

    return undefined;
}

export function getFernWebhookSignatureExtension(
    document: OpenAPIV3.Document,
    operation: OpenAPIV3.OperationObject
): finalIr.WebhookSignatureVerification | undefined {
    const extension = getExtension<WebhookSignatureExtensionSchema | boolean>(
        operation,
        FernOpenAPIExtension.WEBHOOK_SIGNATURE
    );

    if (extension != null) {
        if (typeof extension === "boolean") {
            // Operation says "true" → inherit from document-level config
            const documentExtension = getExtension<WebhookSignatureExtensionSchema>(
                document,
                FernOpenAPIExtension.WEBHOOK_SIGNATURE
            );
            if (documentExtension == null || typeof documentExtension === "boolean") {
                return undefined;
            }
            return convertSignatureSchema(documentExtension);
        }
        return convertSignatureSchema(extension);
    }

    // No operation-level extension; fall back to document-level default for all webhooks
    const documentExtension = getExtension<WebhookSignatureExtensionSchema>(
        document,
        FernOpenAPIExtension.WEBHOOK_SIGNATURE
    );
    if (documentExtension == null || typeof documentExtension === "boolean") {
        return undefined;
    }
    return convertSignatureSchema(documentExtension);
}
