import { assertNever } from "@fern-api/core-utils";
import type { FernIr } from "@fern-fern/ir-sdk";

/**
 * Lowers the IR's `webhookGroups` into the JSON manifest the Rust runtime's
 * `webhooks` module consumes (`CliApp::webhooks(include_str!("webhooks.json"))`).
 *
 * The runtime mirrors these shapes with serde structs in
 * `sdk/src/webhooks.rs`; keep the two in sync.
 */
export interface WebhookManifest {
    secretEnv: string;
    webhooks: WebhookDescriptor[];
}

export interface WebhookDescriptor {
    name: string;
    displayName?: string;
    docs?: string;
    method: "GET" | "POST";
    contentType: "json" | "form";
    examplePayload: Record<string, unknown>;
    headers: { name: string; example?: string }[];
    signature?: HmacSignatureDescriptor;
}

export interface HmacSignatureDescriptor {
    header: string;
    algorithm: "SHA1" | "SHA256" | "SHA384" | "SHA512";
    encoding: "BASE64" | "HEX";
    prefix?: string;
    components: ("BODY" | "TIMESTAMP" | "NOTIFICATION_URL" | "MESSAGE_ID")[];
    delimiter: string;
    bodySort?: "ALPHABETICAL";
    timestamp?: { header: string; format: "UNIX_SECONDS" | "UNIX_MILLIS" | "ISO8601" };
    bodyHash?: {
        algorithm: "SHA1" | "SHA256" | "SHA384" | "SHA512";
        encoding: "BASE64" | "HEX";
        queryParameter: string;
    };
}

/**
 * Default env var for the signing secret: `<BINARY>_WEBHOOK_SECRET`, where
 * `<BINARY>` is the binary name uppercased with `-` → `_`.
 */
export function defaultWebhookSecretEnv(binaryName: string): string {
    return `${binaryName.toUpperCase().replace(/-/g, "_")}_WEBHOOK_SECRET`;
}

export function buildWebhookManifest(args: {
    webhookGroups: Record<string, FernIr.WebhookGroup>;
    types: Record<string, FernIr.TypeDeclaration>;
    secretEnv: string;
}): WebhookManifest | undefined {
    const { webhookGroups, types, secretEnv } = args;
    const groups = Object.entries(webhookGroups);
    if (groups.length === 0) {
        return undefined;
    }
    const multipleGroups = groups.length > 1;
    const descriptors: WebhookDescriptor[] = [];
    const seen = new Set<string>();
    for (const [groupId, group] of groups) {
        for (const webhook of group) {
            const webhookName = nameOrStringToKebab(webhook.name);
            const name = multipleGroups ? `${groupIdToKebab(groupId)}-${webhookName}` : webhookName;
            if (seen.has(name)) {
                throw new Error(`Duplicate webhook command name "${name}" while lowering IR webhookGroups.`);
            }
            seen.add(name);
            const signature = lowerSignature(webhook.signatureVerification);
            descriptors.push({
                name,
                displayName: webhook.displayName ?? undefined,
                docs: webhook.docs ?? undefined,
                method: webhook.method,
                // Alphabetical body sorting only makes sense for form-encoded
                // POST parameters, so a scheme that sorts implies a form body.
                contentType: signature?.bodySort != null ? "form" : "json",
                examplePayload: examplePayload(webhook, types),
                headers: webhook.headers.map((h) => ({ name: nameAndWireValueOrStringToWire(h.name) })),
                signature
            });
        }
    }
    descriptors.sort((a, b) => a.name.localeCompare(b.name));
    return { secretEnv, webhooks: descriptors };
}

function groupIdToKebab(groupId: string): string {
    return groupId
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/^-+|-+$/g, "");
}

function nameOrStringToKebab(name: FernIr.NameOrString): string {
    if (typeof name === "string") {
        return groupIdToKebab(name);
    }
    return name.snakeCase.unsafeName.replace(/_/g, "-");
}

function lowerSignature(
    verification: FernIr.WebhookSignatureVerification | undefined
): HmacSignatureDescriptor | undefined {
    if (verification == null) {
        return undefined;
    }
    switch (verification.type) {
        case "hmac":
            return lowerHmac(verification);
        case "asymmetric":
            // Emulating an asymmetric scheme needs the provider's private
            // key, which the developer never has. Send unsigned.
            return undefined;
        default:
            assertNever(verification);
    }
}

function lowerHmac(hmac: FernIr.HmacSignatureVerification): HmacSignatureDescriptor {
    const bodyHash = hmac.bodyHashBinding;
    let bodyHashDescriptor: HmacSignatureDescriptor["bodyHash"];
    if (bodyHash != null) {
        switch (bodyHash.location.type) {
            case "queryParameter":
                bodyHashDescriptor = {
                    algorithm: bodyHash.algorithm,
                    encoding: bodyHash.encoding,
                    queryParameter: bodyHash.location.name
                };
                break;
            default:
                assertNever(bodyHash.location.type);
        }
    }
    return {
        header: nameAndWireValueOrStringToWire(hmac.signatureHeaderName),
        algorithm: hmac.algorithm,
        encoding: hmac.encoding,
        prefix: hmac.signaturePrefix ?? undefined,
        components: hmac.payloadFormat.components,
        delimiter: hmac.payloadFormat.delimiter,
        bodySort: hmac.payloadFormat.bodySort ?? undefined,
        timestamp:
            hmac.timestamp != null
                ? { header: nameAndWireValueOrStringToWire(hmac.timestamp.headerName), format: hmac.timestamp.format }
                : undefined,
        bodyHash: bodyHashDescriptor
    };
}

function nameAndWireValueOrStringToWire(name: FernIr.NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

/**
 * The payload `webhook invoke` sends by default: the first example on the
 * webhook, else a placeholder object synthesized from the payload's
 * declared properties.
 */
function examplePayload(
    webhook: FernIr.Webhook,
    types: Record<string, FernIr.TypeDeclaration>
): Record<string, unknown> {
    const fromV2 = firstV2Example(webhook.v2Examples);
    if (fromV2 != null) {
        return fromV2;
    }
    const legacy = webhook.examples?.[0]?.payload.jsonExample;
    if (isRecord(legacy)) {
        return legacy;
    }
    return placeholderPayload(webhook.payload, types);
}

function firstV2Example(examples: FernIr.V2WebhookExamples | undefined): Record<string, unknown> | undefined {
    if (examples == null) {
        return undefined;
    }
    for (const bucket of [examples.userSpecifiedExamples, examples.autogeneratedExamples]) {
        for (const example of Object.values(bucket)) {
            if (isRecord(example.payload)) {
                return example.payload;
            }
        }
    }
    return undefined;
}

function placeholderPayload(
    payload: FernIr.WebhookPayload,
    types: Record<string, FernIr.TypeDeclaration>
): Record<string, unknown> {
    switch (payload.type) {
        case "inlinedPayload": {
            const out: Record<string, unknown> = {};
            for (const property of payload.properties) {
                out[nameAndWireValueOrStringToWire(property.name)] = placeholderValue(property.valueType, types);
            }
            return out;
        }
        case "reference": {
            const value = placeholderValue(payload.payloadType, types);
            return isRecord(value) ? value : {};
        }
        default:
            assertNever(payload);
    }
}

function placeholderValue(ref: FernIr.TypeReference, types: Record<string, FernIr.TypeDeclaration>): unknown {
    switch (ref.type) {
        case "primitive":
            switch (ref.primitive.v1) {
                case "INTEGER":
                case "LONG":
                case "UINT":
                case "UINT_64":
                case "FLOAT":
                case "DOUBLE":
                    return 0;
                case "BOOLEAN":
                    return false;
                case "STRING":
                case "DATE":
                case "DATE_TIME":
                case "DATE_TIME_RFC_2822":
                case "UUID":
                case "BASE_64":
                case "BIG_INTEGER":
                    return "string";
                default:
                    assertNever(ref.primitive.v1);
            }
            break;
        case "container":
            return ref.container._visit<unknown>({
                list: () => [],
                set: () => [],
                map: () => ({}),
                optional: (inner) => placeholderValue(inner, types),
                nullable: (inner) => placeholderValue(inner, types),
                literal: (literal) =>
                    literal._visit<unknown>({ string: (s) => s, boolean: (b) => b, _other: () => null }),
                _other: () => null
            });
        case "named": {
            const declaration = types[ref.typeId];
            if (declaration == null) {
                return null;
            }
            const example = declaration.userProvidedExamples[0] ?? declaration.autogeneratedExamples[0];
            if (example != null) {
                return example.jsonExample;
            }
            return declaration.shape._visit<unknown>({
                object: (object) => {
                    const out: Record<string, unknown> = {};
                    for (const property of object.properties) {
                        out[nameAndWireValueOrStringToWire(property.name)] = placeholderValue(
                            property.valueType,
                            types
                        );
                    }
                    return out;
                },
                enum: (enumeration) =>
                    enumeration.values[0] != null
                        ? nameAndWireValueOrStringToWire(enumeration.values[0].name)
                        : "string",
                alias: (alias) => placeholderValue(alias.aliasOf, types),
                union: () => ({}),
                undiscriminatedUnion: () => ({}),
                _other: () => null
            });
        }
        case "unknown":
            return null;
        default:
            assertNever(ref);
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
