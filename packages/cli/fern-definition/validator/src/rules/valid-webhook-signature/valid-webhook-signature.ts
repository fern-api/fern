import { RawSchemas } from "@fern-api/fern-definition-schema";

import { Rule, RuleViolation } from "../../Rule.js";

const VALID_HMAC_ALGORITHMS = new Set<string>(Object.values(RawSchemas.WebhookSignatureAlgorithmSchema));

const VALID_ASYMMETRIC_ALGORITHMS = new Set<string>(Object.values(RawSchemas.AsymmetricAlgorithmSchema));

const VALID_ENCODINGS = new Set<string>(Object.values(RawSchemas.WebhookSignatureEncodingSchema));

const VALID_TIMESTAMP_FORMATS = new Set<string>(Object.values(RawSchemas.WebhookTimestampFormatSchema));

export const ValidWebhookSignatureRule: Rule = {
    name: "valid-webhook-signature",
    create: () => {
        return {
            definitionFile: {
                webhookSignature: (signature) => {
                    return validateSignature(signature);
                }
            }
        };
    }
};

function validateSignature(signature: RawSchemas.WebhookSignatureSchema): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (signature.header == null || signature.header.length === 0) {
        violations.push({
            severity: "error",
            message: "webhook-signature must specify a header"
        });
    }

    if (signature.encoding != null && !VALID_ENCODINGS.has(signature.encoding)) {
        violations.push({
            severity: "error",
            message: `Invalid encoding "${signature.encoding}". Must be one of: ${[...VALID_ENCODINGS].join(", ")}`
        });
    }

    if (signature.timestamp != null) {
        validateTimestamp(signature.timestamp, violations);
    }

    switch (signature.type) {
        case "hmac":
            validateHmac(signature, violations);
            break;
        case "asymmetric":
            validateAsymmetric(signature, violations);
            break;
    }

    return violations;
}

function validateHmac(signature: RawSchemas.WebhookSignatureSchema.Hmac, violations: RuleViolation[]): void {
    if (signature.algorithm != null && !VALID_HMAC_ALGORITHMS.has(signature.algorithm)) {
        violations.push({
            severity: "error",
            message: `Invalid HMAC algorithm "${signature.algorithm}". Must be one of: ${[...VALID_HMAC_ALGORITHMS].join(", ")}`
        });
    }

    if (signature["payload-format"] != null) {
        const format = signature["payload-format"];
        if (format.components != null) {
            const validComponents = new Set<string>(Object.values(RawSchemas.WebhookPayloadComponentSchema));
            for (const component of format.components) {
                if (!validComponents.has(component)) {
                    violations.push({
                        severity: "error",
                        message: `Invalid payload-format component "${component}". Must be one of: ${[...validComponents].join(", ")}`
                    });
                }
            }
        }
    }
}

function validateAsymmetric(
    signature: RawSchemas.WebhookSignatureSchema.Asymmetric,
    violations: RuleViolation[]
): void {
    if (!VALID_ASYMMETRIC_ALGORITHMS.has(signature["asymmetric-algorithm"])) {
        violations.push({
            severity: "error",
            message: `Invalid asymmetric algorithm "${signature["asymmetric-algorithm"]}". Must be one of: ${[...VALID_ASYMMETRIC_ALGORITHMS].join(", ")}`
        });
    }

    if (signature["key-id-header"] != null && signature["jwks-url"] == null) {
        violations.push({
            severity: "warning",
            message: "key-id-header is specified without jwks-url and will be ignored"
        });
    }
}

function validateTimestamp(timestamp: RawSchemas.WebhookTimestampSchema, violations: RuleViolation[]): void {
    if (timestamp.header == null || timestamp.header.length === 0) {
        violations.push({
            severity: "error",
            message: "webhook-signature timestamp must specify a header"
        });
    }

    if (timestamp.format != null && !VALID_TIMESTAMP_FORMATS.has(timestamp.format)) {
        violations.push({
            severity: "error",
            message: `Invalid timestamp format "${timestamp.format}". Must be one of: ${[...VALID_TIMESTAMP_FORMATS].join(", ")}`
        });
    }

    if (timestamp.tolerance != null && timestamp.tolerance <= 0) {
        violations.push({
            severity: "error",
            message: "webhook-signature timestamp tolerance must be a positive number"
        });
    }
}
