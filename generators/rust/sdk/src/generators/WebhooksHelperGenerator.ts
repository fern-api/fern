import { getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const DEFAULT_HELPER_NAME = "WebhooksHelper";
const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;
const INDENT = "    ";

interface WebhookVerificationEntry {
    config: FernIr.HmacSignatureVerification;
    webhookNames: FernIr.WebhookName[];
}

/**
 * Generates `src/webhooks.rs`: a `WebhooksHelper` struct (and any named override helpers)
 * exposing a `verify_signature` associated function for webhooks that declare HMAC
 * signature verification in the IR. Webhooks are grouped by identical verification
 * config: the most frequent config backs the default `WebhooksHelper`, and every other
 * distinct config produces a `<PascalWebhookName>WebhooksHelper`. Asymmetric
 * verification is out of scope and skipped.
 */
export class WebhooksHelperGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): RustFile {
        const { defaultEntry, overrideEntries } = this.collectHmacConfigs();
        if (defaultEntry == null) {
            throw new Error("Cannot generate webhook helpers without an HMAC verification config");
        }

        const lines: string[] = [];
        lines.push("//! Webhook signature verification helpers.");
        lines.push("//!");
        lines.push("//! Each helper exposes `verify_signature`, which never panics and never returns an");
        lines.push("//! error: any missing or malformed input fails closed with `false`.");
        lines.push("");
        lines.push("#[allow(unused_imports)]");
        lines.push(
            "use crate::core::webhook_signature::{self, WebhookDigest, WebhookEncoding, WebhookRequestBody};"
        );
        lines.push("");
        lines.push(...WebhooksHelperGenerator.renderHelper(DEFAULT_HELPER_NAME, defaultEntry.config));

        for (const entry of overrideEntries) {
            const firstWebhookName = entry.webhookNames[0];
            if (firstWebhookName == null) {
                continue;
            }
            const helperName = `${this.context.case.pascalSafe(firstWebhookName)}WebhooksHelper`;
            lines.push("");
            lines.push(...WebhooksHelperGenerator.renderHelper(helperName, entry.config));
        }

        const tests: string[] = [];
        for (const [helperName, config] of [
            [DEFAULT_HELPER_NAME, defaultEntry.config] as const,
            ...overrideEntries.flatMap((entry) => {
                const firstWebhookName = entry.webhookNames[0];
                return firstWebhookName == null
                    ? []
                    : [[`${this.context.case.pascalSafe(firstWebhookName)}WebhooksHelper`, entry.config] as const];
            })
        ]) {
            if (WebhooksHelperGenerator.shouldGenerateBodyHashTest(config)) {
                tests.push(...WebhooksHelperGenerator.renderBodyHashTest(helperName, config));
            }
        }
        if (tests.length > 0) {
            lines.push("");
            lines.push("#[cfg(test)]");
            lines.push("mod tests {");
            lines.push(`${INDENT}use super::*;`);
            lines.push("");
            lines.push(...tests.map((line) => (line === "" ? "" : `${INDENT}${line}`)));
            lines.push("}");
        }

        return new RustFile({
            filename: "webhooks.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: `${lines.join("\n")}\n`
        });
    }

    private collectHmacConfigs(): {
        defaultEntry: WebhookVerificationEntry | undefined;
        overrideEntries: WebhookVerificationEntry[];
    } {
        const grouped = new Map<string, WebhookVerificationEntry>();

        for (const webhookGroup of Object.values(this.context.ir.webhookGroups)) {
            for (const webhook of webhookGroup) {
                const verification = webhook.signatureVerification;
                if (verification == null || verification.type !== "hmac") {
                    continue;
                }
                const key = WebhooksHelperGenerator.computeVerificationKey(verification);
                const existing = grouped.get(key);
                if (existing != null) {
                    existing.webhookNames.push(webhook.name);
                } else {
                    grouped.set(key, { config: verification, webhookNames: [webhook.name] });
                }
            }
        }

        // The most frequent config becomes the default WebhooksHelper (ties broken by insertion order).
        let defaultEntry: WebhookVerificationEntry | undefined;
        let maxCount = 0;
        for (const entry of grouped.values()) {
            if (entry.webhookNames.length > maxCount) {
                maxCount = entry.webhookNames.length;
                defaultEntry = entry;
            }
        }

        const overrideEntries: WebhookVerificationEntry[] = [];
        for (const entry of grouped.values()) {
            if (entry !== defaultEntry) {
                overrideEntries.push(entry);
            }
        }

        return { defaultEntry, overrideEntries };
    }

    private static computeVerificationKey(config: FernIr.HmacSignatureVerification): string {
        return JSON.stringify({
            algorithm: config.algorithm,
            encoding: config.encoding,
            signaturePrefix: config.signaturePrefix ?? null,
            signatureHeaderName: getWireValue(config.signatureHeaderName),
            payloadFormat: {
                components: config.payloadFormat.components,
                delimiter: config.payloadFormat.delimiter,
                bodySort: config.payloadFormat.bodySort ?? null
            },
            bodyHashBinding:
                config.bodyHashBinding == null
                    ? null
                    : {
                          algorithm: config.bodyHashBinding.algorithm,
                          encoding: config.bodyHashBinding.encoding,
                          location: {
                              type: config.bodyHashBinding.location.type,
                              name: WebhooksHelperGenerator.getBodyHashQueryParameterName(
                                  config.bodyHashBinding.location
                              )
                          }
                      },
            timestamp:
                config.timestamp == null
                    ? null
                    : {
                          headerName: getWireValue(config.timestamp.headerName),
                          format: config.timestamp.format,
                          tolerance: config.timestamp.tolerance ?? null
                      },
            notificationUrlNormalization:
                config.notificationUrlNormalization == null
                    ? null
                    : {
                          portVariants: config.notificationUrlNormalization.portVariants,
                          legacyQueryEncoding: config.notificationUrlNormalization.legacyQueryEncoding
                      }
        });
    }

    /**
     * Renders a complete helper struct + impl. Exposed as a static method so the emitted
     * Rust can be unit tested for each verification-config shape without a generator context.
     */
    public static renderHelper(helperName: string, config: FernIr.HmacSignatureVerification): string[] {
        const lines: string[] = [];
        for (const docLine of WebhooksHelperGenerator.buildDocLines(config)) {
            lines.push(docLine === "" ? "///" : `/// ${docLine}`);
        }
        lines.push("#[derive(Debug, Clone, Copy, Default)]");
        lines.push(`pub struct ${helperName};`);
        lines.push("");
        lines.push(`impl ${helperName} {`);
        lines.push(`${INDENT}/// The HTTP header carrying the webhook signature.`);
        lines.push(
            `${INDENT}pub const SIGNATURE_HEADER: &'static str = ${rustStringLiteral(getWireValue(config.signatureHeaderName))};`
        );
        if (config.signaturePrefix != null) {
            lines.push(`${INDENT}/// Prefix stripped from the signature header value before comparison.`);
            lines.push(
                `${INDENT}pub const SIGNATURE_PREFIX: &'static str = ${rustStringLiteral(config.signaturePrefix)};`
            );
        }
        if (config.timestamp != null) {
            lines.push(`${INDENT}/// The HTTP header carrying the webhook timestamp.`);
            lines.push(
                `${INDENT}pub const TIMESTAMP_HEADER: &'static str = ${rustStringLiteral(getWireValue(config.timestamp.headerName))};`
            );
            lines.push(`${INDENT}/// Maximum accepted skew between the timestamp header and the current time.`);
            lines.push(
                `${INDENT}pub const TIMESTAMP_TOLERANCE_SECONDS: i64 = ${config.timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS};`
            );
        }
        lines.push("");
        lines.push(
            `${INDENT}/// Verify an HMAC webhook signature. Returns \`false\` on any mismatch or malformed input.`
        );
        lines.push(`${INDENT}pub fn verify_signature(`);
        for (const param of WebhooksHelperGenerator.buildParameters(config)) {
            lines.push(`${INDENT}${INDENT}${param},`);
        }
        lines.push(`${INDENT}) -> bool {`);
        lines.push(...WebhooksHelperGenerator.renderBody(config).map((line) => (line === "" ? "" : `${INDENT}${INDENT}${line}`)));
        lines.push(`${INDENT}}`);
        lines.push("}");
        return lines;
    }

    private static usesBody(config: FernIr.HmacSignatureVerification): boolean {
        return config.payloadFormat.components.includes("BODY") || config.bodyHashBinding != null;
    }

    private static hasBodySort(config: FernIr.HmacSignatureVerification): boolean {
        return config.payloadFormat.bodySort != null;
    }

    private static buildParameters(config: FernIr.HmacSignatureVerification): string[] {
        const bodyParamName = WebhooksHelperGenerator.usesBody(config) ? "request_body" : "_request_body";
        const params: string[] = [
            WebhooksHelperGenerator.hasBodySort(config)
                ? `${bodyParamName}: impl Into<WebhookRequestBody>`
                : `${bodyParamName}: &str`,
            "signature_header: &str",
            "signature_key: &str"
        ];
        for (const component of config.payloadFormat.components) {
            if (component === "NOTIFICATION_URL") {
                params.push("notification_url: &str");
            } else if (component === "MESSAGE_ID") {
                params.push("message_id: &str");
            }
        }
        if (config.timestamp != null) {
            params.push("timestamp_header: &str");
        }
        return params;
    }

    private static renderBody(config: FernIr.HmacSignatureVerification): string[] {
        const lines: string[] = [];
        lines.push("if signature_header.is_empty() || signature_key.is_empty() {");
        lines.push(`${INDENT}return false;`);
        lines.push("}");

        if (config.timestamp != null) {
            lines.push("");
            lines.push(...WebhooksHelperGenerator.renderTimestampValidation(config.timestamp));
        }

        const signatureExpr = config.signaturePrefix != null ? "signature" : "signature_header";
        if (config.signaturePrefix != null) {
            lines.push("");
            lines.push("let signature = signature_header");
            lines.push(`${INDENT}.strip_prefix(Self::SIGNATURE_PREFIX)`);
            lines.push(`${INDENT}.unwrap_or(signature_header);`);
        }

        const hmacDigest = mapDigest(config.algorithm);
        const hmacEncoding = mapEncoding(config.encoding);
        const hasBodySort = WebhooksHelperGenerator.hasBodySort(config);
        const usesBodyString = config.payloadFormat.components.includes("BODY");
        const binding = config.bodyHashBinding;

        if (hasBodySort && WebhooksHelperGenerator.usesBody(config)) {
            lines.push("");
            lines.push("let request_body: WebhookRequestBody = request_body.into();");
        }

        // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic form-encoded and
        // JSON requests, so branch at runtime on whether the body-hash query parameter is present
        // in the notification URL. When present, hash(rawBody) must match the transmitted value
        // and the signed payload is the URL only.
        if (binding != null) {
            const queryParameterName = WebhooksHelperGenerator.getBodyHashQueryParameterName(binding.location);
            lines.push("");
            lines.push(
                `let transmitted_body_hash = webhook_signature::get_query_parameter(notification_url, ${rustStringLiteral(queryParameterName)});`
            );
            lines.push("if let Some(transmitted_body_hash) = &transmitted_body_hash {");
            if (hasBodySort) {
                lines.push(`${INDENT}let Some(raw_body) = request_body.as_raw() else {`);
                lines.push(`${INDENT}${INDENT}return false;`);
                lines.push(`${INDENT}};`);
            } else {
                lines.push(`${INDENT}let raw_body = request_body;`);
            }
            lines.push(
                `${INDENT}let expected_body_hash = webhook_signature::compute_hash(raw_body, ${mapDigest(binding.algorithm)}, ${mapEncoding(binding.encoding)});`
            );
            lines.push(`${INDENT}if !webhook_signature::timing_safe_equal(&expected_body_hash, transmitted_body_hash) {`);
            lines.push(`${INDENT}${INDENT}return false;`);
            lines.push(`${INDENT}}`);
            lines.push("}");
        }

        if (usesBodyString) {
            lines.push("");
            if (hasBodySort) {
                lines.push("let body_string = request_body.to_signed_string();");
            } else {
                lines.push("let body_string = request_body;");
            }
        }

        const buildPayload = (urlExpr: string): string[] => {
            const formPayload = WebhooksHelperGenerator.buildPayloadExpression(config.payloadFormat, urlExpr);
            if (binding == null) {
                return [`let payload = ${formPayload};`];
            }
            return [
                "let payload = if transmitted_body_hash.is_some() {",
                `${INDENT}${urlExpr}.to_string()`,
                "} else {",
                `${INDENT}${formPayload}`,
                "};"
            ];
        };
        const expectedLine = `let expected = webhook_signature::compute_hmac_signature(&payload, signature_key, ${hmacDigest}, ${hmacEncoding});`;

        // Notification-URL normalization: verify against several normalized URL forms and accept
        // on the first constant-time match.
        const normalization = config.notificationUrlNormalization;
        if (normalization != null) {
            lines.push("");
            lines.push("let candidates = webhook_signature::notification_url_candidates(");
            lines.push(`${INDENT}notification_url,`);
            lines.push(`${INDENT}${normalization.portVariants ? "true" : "false"},`);
            lines.push(`${INDENT}${normalization.legacyQueryEncoding ? "true" : "false"},`);
            lines.push(");");
            lines.push("for candidate_url in &candidates {");
            lines.push(...buildPayload("candidate_url").map((line) => `${INDENT}${line}`));
            lines.push(`${INDENT}${expectedLine}`);
            lines.push(`${INDENT}if webhook_signature::timing_safe_equal(${signatureExpr}, &expected) {`);
            lines.push(`${INDENT}${INDENT}return true;`);
            lines.push(`${INDENT}}`);
            lines.push("}");
            lines.push("false");
            return lines;
        }

        lines.push("");
        lines.push(...buildPayload("notification_url"));
        lines.push(expectedLine);
        lines.push(`webhook_signature::timing_safe_equal(${signatureExpr}, &expected)`);
        return lines;
    }

    private static renderTimestampValidation(timestamp: FernIr.WebhookTimestampConfig): string[] {
        const lines: string[] = [];
        lines.push("if timestamp_header.is_empty() {");
        lines.push(`${INDENT}return false;`);
        lines.push("}");
        switch (timestamp.format) {
            case "UNIX_SECONDS":
                lines.push("let timestamp_ms: i64 = match timestamp_header.parse::<i64>() {");
                lines.push(`${INDENT}Ok(seconds) => seconds.saturating_mul(1000),`);
                lines.push(`${INDENT}Err(_) => return false,`);
                lines.push("};");
                break;
            case "UNIX_MILLIS":
                lines.push("let timestamp_ms: i64 = match timestamp_header.parse::<i64>() {");
                lines.push(`${INDENT}Ok(millis) => millis,`);
                lines.push(`${INDENT}Err(_) => return false,`);
                lines.push("};");
                break;
            case "ISO8601":
            default:
                lines.push(
                    "let timestamp_ms: i64 = match chrono::DateTime::parse_from_rfc3339(timestamp_header) {"
                );
                lines.push(`${INDENT}Ok(parsed) => parsed.timestamp_millis(),`);
                lines.push(`${INDENT}Err(_) => return false,`);
                lines.push("};");
                break;
        }
        lines.push("let now_ms: i64 = std::time::SystemTime::now()");
        lines.push(`${INDENT}.duration_since(std::time::UNIX_EPOCH)`);
        lines.push(`${INDENT}.map(|elapsed| elapsed.as_millis() as i64)`);
        lines.push(`${INDENT}.unwrap_or(0);`);
        lines.push(
            "if (now_ms - timestamp_ms).abs() > Self::TIMESTAMP_TOLERANCE_SECONDS.saturating_mul(1000) {"
        );
        lines.push(`${INDENT}return false;`);
        lines.push("}");
        return lines;
    }

    /**
     * Builds the Rust expression (of type `String`) for the signed payload from the
     * configured components. `urlExpr` names the notification-URL binding: normally
     * `notification_url` (a `&str`), but the candidate loop substitutes `candidate_url`
     * (a `&String`).
     */
    private static buildPayloadExpression(payloadFormat: FernIr.WebhookPayloadFormat, urlExpr: string): string {
        const componentExprs: string[] = [];
        for (const component of payloadFormat.components) {
            switch (component) {
                case "BODY":
                    componentExprs.push("body_string");
                    break;
                case "TIMESTAMP":
                    componentExprs.push("timestamp_header");
                    break;
                case "NOTIFICATION_URL":
                    componentExprs.push(urlExpr);
                    break;
                case "MESSAGE_ID":
                    componentExprs.push("message_id");
                    break;
                default:
                    break;
            }
        }
        const [first] = componentExprs;
        if (componentExprs.length === 1 && first != null) {
            return `${first}.to_string()`;
        }
        // Every component is Display, so a single `format!` handles the mix of `&str`,
        // `String`, and `&String` bindings.
        const formatDelimiter = payloadFormat.delimiter.replace(/\{/g, "{{").replace(/\}/g, "}}");
        const template = rustStringLiteral(componentExprs.map(() => "{}").join(formatDelimiter));
        return `format!(${template}, ${componentExprs.join(", ")})`;
    }

    private static shouldGenerateBodyHashTest(config: FernIr.HmacSignatureVerification): boolean {
        return config.bodyHashBinding != null && config.payloadFormat.components.includes("NOTIFICATION_URL");
    }

    /**
     * Emits a unit test exercising the body-hash (JSON) path of a helper: the hash of the raw
     * body travels in the notification URL, so a matching body + signature verifies while a
     * tampered body, tampered hash, tampered signature, or wrong secret does not.
     */
    private static renderBodyHashTest(helperName: string, config: FernIr.HmacSignatureVerification): string[] {
        const binding = config.bodyHashBinding;
        if (binding == null) {
            return [];
        }
        const queryParameterName = WebhooksHelperGenerator.getBodyHashQueryParameterName(binding.location);
        const testName = `${convertToSnake(helperName)}_body_hash_binding`;
        const extraArgs: string[] = [];
        for (const component of config.payloadFormat.components) {
            if (component === "MESSAGE_ID") {
                extraArgs.push('"message-id"');
            }
        }
        const timestampArg = config.timestamp != null ? [`&timestamp`] : [];
        const timestampSetup: string[] =
            config.timestamp != null
                ? [`let timestamp = ${WebhooksHelperGenerator.timestampNowExpression(config.timestamp)};`]
                : [];
        const callArgs = (body: string, url: string, key: string, sig: string): string =>
            [body, sig, key, url, ...extraArgs, ...timestampArg].join(", ");

        const lines: string[] = [];
        lines.push("#[test]");
        lines.push(`fn ${testName}() {`);
        lines.push(`${INDENT}let request_body = r#"{"event":"example"}"#;`);
        lines.push(`${INDENT}let signature_key = "test-secret";`);
        lines.push(
            `${INDENT}let body_hash = webhook_signature::compute_hash(request_body, ${mapDigest(binding.algorithm)}, ${mapEncoding(binding.encoding)});`
        );
        lines.push(
            `${INDENT}let notification_url = format!("https://example.com/webhook?z=last&${queryParameterName}={}&a=first%20value", body_hash);`
        );
        lines.push(
            `${INDENT}let tampered_url = "https://example.com/webhook?z=last&${queryParameterName}=tampered&a=first%20value";`
        );
        lines.push(...timestampSetup.map((line) => `${INDENT}${line}`));
        lines.push(
            `${INDENT}let sign = |url: &str, key: &str| webhook_signature::compute_hmac_signature(url, key, ${mapDigest(config.algorithm)}, ${mapEncoding(config.encoding)});`
        );
        lines.push(`${INDENT}let signature = sign(&notification_url, signature_key);`);
        lines.push("");
        lines.push(`${INDENT}assert!(${helperName}::verify_signature(`);
        lines.push(`${INDENT}${INDENT}${callArgs("request_body", "&notification_url", "signature_key", "&signature")}`);
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        const tamperedBody = WebhooksHelperGenerator.hasBodySort(config)
            ? 'format!("{} ", request_body)'
            : '&format!("{} ", request_body)';
        lines.push(
            `${INDENT}${INDENT}${callArgs(tamperedBody, "&notification_url", "signature_key", "&signature")}`
        );
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        lines.push(
            `${INDENT}${INDENT}${callArgs("request_body", "tampered_url", "signature_key", "&sign(tampered_url, signature_key)")}`
        );
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        lines.push(
            `${INDENT}${INDENT}${callArgs("request_body", "&notification_url", "signature_key", '"tampered-signature"')}`
        );
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        lines.push(`${INDENT}${INDENT}${callArgs("request_body", "&notification_url", '"wrong-secret"', "&signature")}`);
        lines.push(`${INDENT}));`);
        lines.push("}");

        if (WebhooksHelperGenerator.hasBodySort(config) && config.payloadFormat.components.includes("BODY")) {
            lines.push("");
            lines.push(...WebhooksHelperGenerator.renderFormBodyTest(helperName, config, callArgs, timestampSetup));
        }
        return lines;
    }

    /**
     * Emits a unit test for the classic form-encoded path of a helper: no body hash on the
     * URL, multi-value parameters sorted and deduplicated, and (when configured) a
     * signature computed over a port-qualified URL still verifying against the port-less one.
     */
    private static renderFormBodyTest(
        helperName: string,
        config: FernIr.HmacSignatureVerification,
        callArgs: (body: string, url: string, key: string, sig: string) => string,
        timestampSetup: string[]
    ): string[] {
        const testName = `${convertToSnake(helperName)}_form_body`;
        const lines: string[] = [];
        lines.push("#[test]");
        lines.push(`fn ${testName}() {`);
        lines.push(`${INDENT}let signature_key = "test-secret";`);
        lines.push(`${INDENT}let notification_url = "https://example.com/webhook?a=1";`);
        lines.push(`${INDENT}let form: &[(&str, &str)] = &[("To", "+15551234567"), ("Body", "z"), ("Body", "a"), ("Body", "z")];`);
        lines.push(`${INDENT}let body: WebhookRequestBody = form.into();`);
        lines.push(`${INDENT}assert_eq!(body.to_signed_string(), "BodyaBodyzTo+15551234567");`);
        lines.push(...timestampSetup.map((line) => `${INDENT}${line}`));
        lines.push(
            `${INDENT}let sign = |url: &str, key: &str| webhook_signature::compute_hmac_signature(&format!("{}{}", url, body.to_signed_string()), key, ${mapDigest(config.algorithm)}, ${mapEncoding(config.encoding)});`
        );
        lines.push(`${INDENT}let signature = sign(notification_url, signature_key);`);
        lines.push("");
        lines.push(`${INDENT}assert!(${helperName}::verify_signature(`);
        lines.push(`${INDENT}${INDENT}${callArgs("form", "notification_url", "signature_key", "&signature")}`);
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        lines.push(
            `${INDENT}${INDENT}${callArgs('&[("To", "+15551234567"), ("Body", "tampered")][..]', "notification_url", "signature_key", "&signature")}`
        );
        lines.push(`${INDENT}));`);
        lines.push(`${INDENT}assert!(!${helperName}::verify_signature(`);
        lines.push(`${INDENT}${INDENT}${callArgs("form", "notification_url", '"wrong-secret"', "&signature")}`);
        lines.push(`${INDENT}));`);
        if (config.notificationUrlNormalization?.portVariants === true) {
            lines.push("");
            lines.push(`${INDENT}let signed_with_port = sign("https://example.com:443/webhook?a=1", signature_key);`);
            lines.push(`${INDENT}assert!(${helperName}::verify_signature(`);
            lines.push(`${INDENT}${INDENT}${callArgs("form", "notification_url", "signature_key", "&signed_with_port")}`);
            lines.push(`${INDENT}));`);
        }
        lines.push("}");
        return lines;
    }

    private static timestampNowExpression(timestamp: FernIr.WebhookTimestampConfig): string {
        const nowSecs =
            "std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)";
        switch (timestamp.format) {
            case "UNIX_SECONDS":
                return `${nowSecs}.to_string()`;
            case "UNIX_MILLIS":
                return `(${nowSecs} * 1000).to_string()`;
            case "ISO8601":
            default:
                return "chrono::Utc::now().to_rfc3339()";
        }
    }

    private static getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return location._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: (other) => {
                throw new Error(`Unsupported webhook body-hash location: ${other.type}`);
            }
        });
    }

    private static buildDocLines(config: FernIr.HmacSignatureVerification): string[] {
        const signatureHeader = getWireValue(config.signatureHeaderName);
        const lines: string[] = [
            "Verifies HMAC webhook signatures.",
            "",
            `Extract the signature from the \`${signatureHeader}\` header and pass it as \`signature_header\`.`
        ];
        if (config.timestamp != null) {
            const timestampHeader = getWireValue(config.timestamp.headerName);
            lines.push(`Extract the timestamp from the \`${timestampHeader}\` header and pass it as \`timestamp_header\`.`);
        }
        if (config.payloadFormat.bodySort != null) {
            lines.push(
                "`request_body` accepts either the raw body (`&str` / `String`) or parsed POST form",
                "parameters (a map of key to value(s), or a slice of `(key, value)` pairs). For a form,",
                "keys are sorted and each key's values are deduplicated and sorted, then concatenated as",
                "key-value pairs before signing."
            );
        }
        if (config.bodyHashBinding != null) {
            lines.push(
                "Both classic form-encoded and JSON requests are verified: the helper branches at runtime",
                "on whether the body-hash query parameter is present on the notification URL. For a JSON",
                "request the raw body is checked against that separately transmitted hash and the",
                "signature is verified over the notification URL only. Pass the exact raw body as",
                "`request_body` and the verbatim notification URL as `notification_url`."
            );
        }
        if (config.notificationUrlNormalization != null) {
            lines.push(
                "The signature is verified against several normalized forms of the notification URL,",
                "succeeding if any candidate matches."
            );
        }
        return lines;
    }
}

function mapDigest(algorithm: FernIr.HmacAlgorithm | FernIr.WebhookBodyHashAlgorithm): string {
    switch (algorithm) {
        case "SHA1":
            return "WebhookDigest::Sha1";
        case "SHA256":
            return "WebhookDigest::Sha256";
        case "SHA384":
            return "WebhookDigest::Sha384";
        case "SHA512":
            return "WebhookDigest::Sha512";
        default:
            throw new Error(`Unrecognized webhook digest algorithm: ${algorithm}`);
    }
}

function mapEncoding(encoding: FernIr.WebhookSignatureEncoding): string {
    switch (encoding) {
        case "BASE64":
            return "WebhookEncoding::Base64";
        case "HEX":
            return "WebhookEncoding::Hex";
        default:
            throw new Error(`Unrecognized webhook signature encoding: ${encoding}`);
    }
}

function convertToSnake(pascal: string): string {
    return pascal
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
        .toLowerCase();
}

/**
 * Renders a string as a Rust double-quoted literal, escaping backslashes, quotes, and
 * control characters so an API spec cannot inject code into the generated helper.
 */
function rustStringLiteral(value: string): string {
    const escaped = value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    return `"${escaped}"`;
}
