import { finalIr } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

type AsymmetricAlgorithmString =
    | "rsa-sha256"
    | "rsa-sha384"
    | "rsa-sha512"
    | "ecdsa-sha256"
    | "ecdsa-sha384"
    | "ecdsa-sha512"
    | "ed25519";

interface WebhookTimestampExtensionSchema {
    header: string;
    format?: "unix-seconds" | "unix-millis" | "iso8601";
    tolerance?: number;
}

interface WebhookPayloadFormatExtensionSchema {
    components: Array<"body" | "timestamp" | "notification-url" | "message-id">;
    delimiter?: string;
    "body-sort"?: "alphabetical";
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
    "asymmetric-algorithm"?: AsymmetricAlgorithmString;
    "jwks-url"?: string;
    "key-id-header"?: string;
}

function convertTimestampFormat(format: "unix-seconds" | "unix-millis" | "iso8601"): finalIr.WebhookTimestampFormat {
    switch (format) {
        case "unix-seconds":
            return finalIr.WebhookTimestampFormat.UnixSeconds;
        case "unix-millis":
            return finalIr.WebhookTimestampFormat.UnixMillis;
        case "iso8601":
            return finalIr.WebhookTimestampFormat.Iso8601;
    }
}

function convertTimestamp(
    timestamp: WebhookTimestampExtensionSchema | undefined
): finalIr.WebhookTimestamp | undefined {
    if (timestamp == null) {
        return undefined;
    }
    return {
        header: timestamp.header,
        format: timestamp.format != null ? convertTimestampFormat(timestamp.format) : undefined,
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
        delimiter: payloadFormat.delimiter,
        bodySort: convertBodySort(payloadFormat["body-sort"])
    };
}

function convertBodySort(bodySort: "alphabetical" | undefined): finalIr.WebhookPayloadBodySort | undefined {
    if (bodySort == null) {
        return undefined;
    }
    switch (bodySort) {
        case "alphabetical":
            return finalIr.WebhookPayloadBodySort.Alphabetical;
    }
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

function convertEncoding(encoding: "base64" | "hex" | undefined): finalIr.WebhookSignatureEncoding | undefined {
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
    algorithm: AsymmetricAlgorithmString | undefined
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

function getDocumentLevelSignature(document: OpenAPIV3.Document): finalIr.WebhookSignatureVerification | undefined {
    const extension = getExtension<WebhookSignatureExtensionSchema>(document, FernOpenAPIExtension.WEBHOOK_SIGNATURE);
    if (extension == null || typeof extension === "boolean") {
        return undefined;
    }
    return convertSignatureSchema(extension);
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
            return getDocumentLevelSignature(document);
        }
        return convertSignatureSchema(extension);
    }

    // No operation-level extension; fall back to document-level default for all webhooks
    return getDocumentLevelSignature(document);
}
