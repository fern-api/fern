import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { WebhooksHelperGenerator } from "../WebhooksHelperGenerator.js";

function createWireValue(name: string): FernIr.NameAndWireValue {
    return {
        wireValue: name,
        name: {
            originalName: name,
            camelCase: { unsafeName: name, safeName: name },
            snakeCase: { unsafeName: name, safeName: name },
            screamingSnakeCase: { unsafeName: name, safeName: name },
            pascalCase: { unsafeName: name, safeName: name }
        }
    };
}

function bodySHA256Location(): FernIr.WebhookBodyHashLocation {
    return FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" });
}

interface HmacConfigOverrides {
    algorithm?: FernIr.HmacAlgorithm;
    encoding?: FernIr.WebhookSignatureEncoding;
    signaturePrefix?: string;
    timestamp?: FernIr.WebhookTimestampConfig;
    components?: FernIr.WebhookPayloadComponent[];
    delimiter?: string;
    bodySort?: FernIr.WebhookPayloadBodySort;
    bodyHashBinding?: FernIr.WebhookBodyHashBinding;
    notificationUrlNormalization?: FernIr.WebhookNotificationUrlNormalization;
}

function hmacConfig(overrides: HmacConfigOverrides = {}): FernIr.HmacSignatureVerification {
    return {
        algorithm: overrides.algorithm ?? "SHA256",
        encoding: overrides.encoding ?? "HEX",
        signatureHeaderName: createWireValue("X-Signature"),
        signaturePrefix: overrides.signaturePrefix,
        timestamp: overrides.timestamp,
        bodyHashBinding: overrides.bodyHashBinding,
        notificationUrlNormalization: overrides.notificationUrlNormalization,
        payloadFormat: {
            components: overrides.components ?? ["BODY"],
            delimiter: overrides.delimiter ?? ".",
            bodySort: overrides.bodySort
        }
    };
}

// The render helper is a static method that does not touch the generator context, so it
// can exercise the emitted Ruby for each verification-config shape without a full context.
function render(config: FernIr.HmacSignatureVerification): string {
    return WebhooksHelperGenerator.renderVerifySignatureBody(config);
}

describe("WebhooksHelperGenerator", () => {
    describe("no-throw behavior", () => {
        it("returns false on missing required inputs rather than raising", () => {
            const body = render(hmacConfig());
            expect(body).toContain(
                "return false if request_body.nil? || signature_header.nil? || signature_header.empty? || signature_key.nil? || signature_key.empty?"
            );
            expect(body).not.toContain("raise");
        });

        it("returns false on missing/malformed timestamp rather than raising", () => {
            const body = render(
                hmacConfig({
                    timestamp: { headerName: createWireValue("X-Timestamp"), format: "UNIX_SECONDS", tolerance: 300 }
                })
            );
            expect(body).toContain('return false if timestamp_header.nil? || timestamp_header == ""');
            expect(body).toContain("rescue ArgumentError, TypeError");
            // The parse-failure branch returns false instead of raising.
            expect(body).not.toContain("raise");
        });
    });

    describe("timestamp validation", () => {
        it("scales UNIX_SECONDS by 1000", () => {
            const body = render(
                hmacConfig({
                    timestamp: { headerName: createWireValue("X-Timestamp"), format: "UNIX_SECONDS", tolerance: 300 }
                })
            );
            expect(body).toContain("timestamp_ms = timestamp_value * 1000");
        });

        it("uses UNIX_MILLIS verbatim", () => {
            const body = render(
                hmacConfig({
                    timestamp: { headerName: createWireValue("X-Timestamp"), format: "UNIX_MILLIS", tolerance: 300 }
                })
            );
            expect(body).toContain("timestamp_ms = timestamp_value\n");
            expect(body).not.toContain("timestamp_value * ");
        });

        it("parses ISO8601 and returns false on failure", () => {
            const body = render(
                hmacConfig({
                    timestamp: { headerName: createWireValue("X-Timestamp"), format: "ISO8601", tolerance: undefined }
                })
            );
            expect(body).toContain("Time.iso8601(timestamp_header)");
            expect(body).toContain("return false");
        });
    });

    describe("behavior 1: multi-value form params", () => {
        it("emits sorted/deduped key-value assembly when bodySort is set", () => {
            const body = render(hmacConfig({ components: ["BODY"], delimiter: "", bodySort: "ALPHABETICAL" }));
            expect(body).toContain("body_string =");
            expect(body).toContain("if request_body.is_a?(::Hash)");
            expect(body).toContain("request_body.keys.sort.map do |key|");
            expect(body).toContain("values = value.is_a?(::Array) ? value : [value]");
            expect(body).toContain('values.uniq.sort.map { |v| "#{key}#{v}" }.join');
            expect(body).toContain("payload = body_string");
        });

        it("does not emit body-sort assembly when bodySort is absent", () => {
            const body = render(hmacConfig({ components: ["BODY"] }));
            expect(body).not.toContain("body_string");
            expect(body).toContain("payload = request_body");
        });
    });

    describe("payload construction", () => {
        it("joins multiple components with the delimiter", () => {
            const body = render(hmacConfig({ components: ["MESSAGE_ID", "TIMESTAMP", "BODY"], delimiter: "." }));
            expect(body).toContain('payload = [message_id, timestamp_header, request_body].join(".")');
        });

        it("emits a single component directly without an array join", () => {
            const body = render(hmacConfig({ components: ["NOTIFICATION_URL"], delimiter: "" }));
            expect(body).toContain("payload = notification_url");
        });
    });

    describe("behavior 2: runtime body-hash branch", () => {
        it("branches at runtime on the transmitted body hash and compares in constant time", () => {
            const body = render(
                hmacConfig({
                    algorithm: "SHA1",
                    encoding: "BASE64",
                    components: ["NOTIFICATION_URL"],
                    delimiter: "",
                    bodyHashBinding: { algorithm: "SHA256", encoding: "HEX", location: bodySHA256Location() }
                })
            );
            expect(body).toContain(
                'transmitted_body_hash = Internal::WebhookBodyHash.get_query_parameter(notification_url, "bodySHA256")'
            );
            expect(body).toContain("payload =");
            expect(body).toContain("if transmitted_body_hash.nil?");
            // JSON path: signs the URL only and compares the recomputed body hash.
            expect(body).toContain("expected_body_hash = Internal::WebhookBodyHash.compute_hash(");
            expect(body).toContain(
                "return false unless Internal::WebhookSignature.timing_safe_equal(expected_body_hash, " +
                    "transmitted_body_hash)"
            );
            expect(body).toContain("notification_url");
        });

        it("signs URL + sorted params on the classic-form (absent hash) path", () => {
            const body = render(
                hmacConfig({
                    algorithm: "SHA1",
                    encoding: "BASE64",
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL",
                    bodyHashBinding: { algorithm: "SHA256", encoding: "HEX", location: bodySHA256Location() }
                })
            );
            expect(body).toContain("body_string =");
            expect(body).toContain("if request_body.is_a?(::Hash)");
            expect(body).toContain("[notification_url, body_string].join");
        });
    });

    describe("behavior 4: URL normalization candidate loop", () => {
        const normalizationConfig = hmacConfig({
            algorithm: "SHA1",
            encoding: "BASE64",
            components: ["NOTIFICATION_URL", "BODY"],
            delimiter: "",
            bodySort: "ALPHABETICAL",
            bodyHashBinding: { algorithm: "SHA256", encoding: "HEX", location: bodySHA256Location() },
            notificationUrlNormalization: { portVariants: true, legacyQueryEncoding: true }
        });

        it("runs the body-hash check once above the candidate loop", () => {
            const body = render(normalizationConfig);
            const hashIndex = body.indexOf("expected_body_hash = Internal::WebhookBodyHash.compute_hash");
            const loopIndex = body.indexOf("candidates.each do |candidate_url|");
            expect(hashIndex).toBeGreaterThanOrEqual(0);
            expect(loopIndex).toBeGreaterThanOrEqual(0);
            expect(hashIndex).toBeLessThan(loopIndex);
            // The body hash is only checked when the query param is present.
            expect(body).toContain("unless transmitted_body_hash.nil?");
        });

        it("builds candidates with the configured normalization options and ORs matches", () => {
            const body = render(normalizationConfig);
            expect(body).toContain("candidates = Internal::WebhookSignature.notification_url_candidates(");
            expect(body).toContain("port_variants: true,");
            expect(body).toContain("legacy_query_encoding: true");
            // JSON request signs the URL only; classic form signs URL + params.
            expect(body).toContain(
                "payload = transmitted_body_hash.nil? ? [candidate_url, body_string].join : candidate_url"
            );
            expect(body).toContain(
                "return true if Internal::WebhookSignature.timing_safe_equal(signature_header, expected)"
            );
            expect(body.trimEnd().endsWith("false")).toBe(true);
        });

        it("signs each candidate URL without a body-hash binding", () => {
            const body = render(
                hmacConfig({
                    algorithm: "SHA1",
                    encoding: "BASE64",
                    components: ["NOTIFICATION_URL"],
                    delimiter: "",
                    notificationUrlNormalization: { portVariants: true, legacyQueryEncoding: false }
                })
            );
            expect(body).not.toContain("transmitted_body_hash");
            expect(body).toContain("payload = candidate_url");
            expect(body).toContain("port_variants: true,");
            expect(body).toContain("legacy_query_encoding: false");
        });
    });

    describe("signature extraction", () => {
        it("strips the configured signature prefix", () => {
            const body = render(hmacConfig({ signaturePrefix: "sha256=" }));
            expect(body).toContain("signature_header.start_with?(SIGNATURE_PREFIX)");
        });
    });
});
