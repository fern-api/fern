import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { Comments } from "../utils/comments.js";

const DEFAULT_HELPER_CLASS_NAME = "WebhooksHelper";
const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

interface WebhookVerificationEntry {
    config: FernIr.HmacSignatureVerification;
    webhookNames: FernIr.WebhookName[];
}

/**
 * Generates the `WebhooksHelper` class (and any named override helpers) exposing a
 * static `verify_signature` method for webhooks that declare HMAC signature
 * verification in the IR. Webhooks are grouped by identical verification config:
 * the most frequent config backs the default `WebhooksHelper`, and every other
 * distinct config produces a `<PascalWebhookName>WebhooksHelper`. Asymmetric
 * verification is out of scope and skipped; when no webhook declares HMAC
 * verification, nothing is emitted.
 */
export class WebhooksHelperGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): RubyFile[] {
        const { defaultEntry, overrideEntries } = this.collectHmacConfigs();
        if (defaultEntry == null) {
            return [];
        }

        const files: RubyFile[] = [
            this.buildHelperFile({
                className: DEFAULT_HELPER_CLASS_NAME,
                filename: "webhooks_helper.rb",
                config: defaultEntry.config
            })
        ];
        if (this.shouldGenerateBodyHashRuntimeTest(defaultEntry.config)) {
            files.push(
                this.buildBodyHashRuntimeTestFile({
                    className: DEFAULT_HELPER_CLASS_NAME,
                    filename: "test_webhooks_helper.rb",
                    config: defaultEntry.config
                })
            );
        }

        for (const entry of overrideEntries) {
            const firstWebhookName = entry.webhookNames[0];
            if (firstWebhookName == null) {
                continue;
            }
            const className = `${this.case.pascalSafe(firstWebhookName)}WebhooksHelper`;
            const helperFilename = `${this.case.snakeSafe(className)}.rb`;
            files.push(this.buildHelperFile({ className, filename: helperFilename, config: entry.config }));
            if (this.shouldGenerateBodyHashRuntimeTest(entry.config)) {
                files.push(
                    this.buildBodyHashRuntimeTestFile({
                        className,
                        filename: `test_${helperFilename}`,
                        config: entry.config
                    })
                );
            }
        }

        return files;
    }

    private get case(): CaseConverter {
        return this.context.caseConverter;
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
                const key = this.computeVerificationKey(verification);
                const existing = grouped.get(key);
                if (existing != null) {
                    existing.webhookNames.push(webhook.name);
                } else {
                    grouped.set(key, { config: verification, webhookNames: [webhook.name] });
                }
            }
        }

        if (grouped.size === 0) {
            return { defaultEntry: undefined, overrideEntries: [] };
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

    private computeVerificationKey(config: FernIr.HmacSignatureVerification): string {
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
                      }
        });
    }

    private buildHelperFile({
        className,
        filename,
        config
    }: {
        className: string;
        filename: string;
        config: FernIr.HmacSignatureVerification;
    }): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({ name: className, docstring: this.buildDocstring(config) });

        for (const constant of this.buildConstants(config)) {
            class_.addStatement(ruby.codeblock(constant));
        }

        class_.addMethod(this.buildVerifyMethod(config));

        rootModule.addStatement(class_);

        const requires = this.buildRequires(config);
        const node = ruby.codeblock((writer) => {
            ruby.comment({ docs: Comments.FrozenStringLiteral }).write(writer);
            writer.newLine();
            if (requires.length > 0) {
                for (const requirePath of requires) {
                    writer.writeLine(`require "${requirePath}"`);
                }
                writer.newLine();
            }
            rootModule.write(writer);
        });

        return new RubyFile({
            node,
            directory: this.context.getRootFolderPath(),
            filename,
            customConfig: this.context.customConfig
        });
    }

    private buildRequires(config: FernIr.HmacSignatureVerification): string[] {
        // `require "time"` is needed whenever the emitted body can reach a Time.parse /
        // Time.iso8601 call: the ISO8601 branch always does, and the default branch
        // (any future/unknown timestamp format) falls through to Time.parse.
        const timestampFormat = config.timestamp?.format;
        if (timestampFormat != null && timestampFormat !== "UNIX_SECONDS" && timestampFormat !== "UNIX_MILLIS") {
            return ["time"];
        }
        return [];
    }

    private shouldGenerateBodyHashRuntimeTest(config: FernIr.HmacSignatureVerification): boolean {
        return (
            config.bodyHashBinding != null &&
            config.payloadFormat.components.length === 1 &&
            config.payloadFormat.components[0] === "NOTIFICATION_URL"
        );
    }

    private buildBodyHashRuntimeTestFile({
        className,
        filename,
        config
    }: {
        className: string;
        filename: string;
        config: FernIr.HmacSignatureVerification;
    }): RubyFile {
        const binding = config.bodyHashBinding;
        if (binding == null) {
            throw new Error("Cannot generate a body-hash runtime test without a body-hash binding");
        }
        const bodyHashAlgorithm = mapBodyHashAlgorithm(binding.algorithm);
        const bodyHashEncoding = mapEncoding(binding.encoding);
        const hmacAlgorithm = mapHmacAlgorithm(config.algorithm);
        const hmacEncoding = mapEncoding(config.encoding);
        const queryParameterName = WebhooksHelperGenerator.getBodyHashQueryParameterName(binding.location);
        const rootModuleName = this.context.getRootModuleName();

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: Comments.FrozenStringLiteral }).write(writer);
                writer.newLine();
                writer.writeLine('require "test_helper"');
                writer.newLine();
                writer.writeLine(`describe ${rootModuleName}::${className} do`);
                writer.indent();
                writer.writeLine('it "verifies the raw body binding before the HMAC over the verbatim URL" do');
                writer.indent();
                writer.writeLine(`body = ${rubyStringLiteral('{"messageSid":"SM123","status":"delivered"}')}`);
                writer.writeLine('secret = "supersecret"');
                writer.writeLine(`body_hash = ${rootModuleName}::Internal::WebhookBodyHash.compute_hash(`);
                writer.indent();
                writer.writeLine("payload: body,");
                writer.writeLine(`algorithm: "${bodyHashAlgorithm}",`);
                writer.writeLine(`encoding: "${bodyHashEncoding}"`);
                writer.dedent();
                writer.writeLine(")");
                writer.writeLine(
                    `body_hash_query = URI.encode_www_form([[${rubyStringLiteral(queryParameterName)}, body_hash]])`
                );
                writer.writeLine(
                    'notification_url = "https://example.com/hooks/sms?z=last&#{body_hash_query}&' +
                        'a=first%20value&dup=1&dup=2"'
                );
                writer.writeLine("sign = ->(url) do");
                writer.indent();
                writer.writeLine(`${rootModuleName}::Internal::WebhookSignature.compute_hmac_signature(`);
                writer.indent();
                writer.writeLine("payload: url,");
                writer.writeLine("secret: secret,");
                writer.writeLine(`algorithm: "${hmacAlgorithm}",`);
                writer.writeLine(`encoding: "${hmacEncoding}"`);
                writer.dedent();
                writer.writeLine(")");
                writer.dedent();
                writer.writeLine("end");
                writer.writeLine("verify = ->(request_body:, url:, signature:, signature_key: secret) do");
                writer.indent();
                writer.writeLine(`${rootModuleName}::${className}.verify_signature(`);
                writer.indent();
                writer.writeLine("request_body: request_body,");
                writer.writeLine("signature_header: signature,");
                writer.writeLine("signature_key: signature_key,");
                writer.writeLine("notification_url: url");
                writer.dedent();
                writer.writeLine(")");
                writer.dedent();
                writer.writeLine("end");
                writer.newLine();
                writer.writeLine("signature = sign.call(notification_url)");
                writer.newLine();
                writer.writeLine("assert verify.call(request_body: body, url: notification_url, signature: signature)");
                writer.newLine();
                writer.writeLine(
                    'refute verify.call(request_body: "#{body} ", url: notification_url, signature: signature)'
                );
                writer.newLine();
                writer.writeLine(
                    `tampered_query = URI.encode_www_form([[${rubyStringLiteral(queryParameterName)}, "#{body_hash}x"]])`
                );
                writer.writeLine("tampered_url = notification_url.sub(body_hash_query, tampered_query)");
                writer.newLine();
                writer.writeLine(
                    "refute verify.call(request_body: body, url: tampered_url, signature: sign.call(tampered_url))"
                );
                writer.newLine();
                writer.writeLine(
                    'refute verify.call(request_body: body, url: notification_url, signature: "x#{signature[1..]}")'
                );
                writer.writeLine("refute verify.call(");
                writer.indent();
                writer.writeLine("request_body: body,");
                writer.writeLine("url: notification_url,");
                writer.writeLine("signature: signature,");
                writer.writeLine('signature_key: "wrong-secret"');
                writer.dedent();
                writer.writeLine(")");
                writer.newLine();
                writer.writeLine('url_without_hash = "https://example.com/hooks/sms?z=last"');
                writer.newLine();
                writer.writeLine(
                    "refute verify.call(request_body: body, url: url_without_hash, signature: sign.call(url_without_hash))"
                );
                writer.dedent();
                writer.writeLine("end");
                writer.dedent();
                writer.writeLine("end");
            }),
            directory: RelativeFilePath.of("test/unit"),
            filename,
            customConfig: this.context.customConfig
        });
    }

    private buildConstants(config: FernIr.HmacSignatureVerification): string[] {
        const constants: string[] = [];
        if (config.timestamp != null) {
            const tolerance = config.timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS;
            constants.push(`TIMESTAMP_TOLERANCE_SECONDS = ${tolerance}`);
        }
        if (config.signaturePrefix != null) {
            constants.push(`SIGNATURE_PREFIX = ${rubyStringLiteral(config.signaturePrefix)}`);
        }
        return constants;
    }

    private buildVerifyMethod(config: FernIr.HmacSignatureVerification): ruby.Method {
        const method = ruby.method({
            name: "verify_signature",
            kind: ruby.MethodKind.Class_,
            parameters: { keyword: this.buildParameters(config) },
            returnType: ruby.Type.boolean()
        });
        method.addStatement(ruby.codeblock((writer) => WebhooksHelperGenerator.writeMethodBody(writer, config)));
        return method;
    }

    /**
     * Renders the body of the generated `verify_signature` method to a string. Exposed as a
     * static method for unit testing the emitted Ruby for each verification-config shape
     * without a full generator context.
     */
    public static renderVerifySignatureBody(config: FernIr.HmacSignatureVerification): string {
        const writer = new ruby.Writer({ customConfig: {} });
        WebhooksHelperGenerator.writeMethodBody(writer, config);
        return writer.toString();
    }

    private buildParameters(config: FernIr.HmacSignatureVerification): ruby.KeywordParameter[] {
        const bodyType =
            config.payloadFormat.bodySort != null
                ? ruby.Type.union([
                      ruby.Type.string(),
                      ruby.Type.hash(
                          ruby.Type.string(),
                          ruby.Type.union([ruby.Type.string(), ruby.Type.array(ruby.Type.string())])
                      )
                  ])
                : ruby.Type.string();
        const params: ruby.KeywordParameter[] = [
            ruby.parameters.keyword({ name: "request_body", type: bodyType }),
            ruby.parameters.keyword({ name: "signature_header", type: ruby.Type.string() }),
            ruby.parameters.keyword({ name: "signature_key", type: ruby.Type.string() })
        ];
        for (const component of config.payloadFormat.components) {
            if (component === "NOTIFICATION_URL") {
                params.push(ruby.parameters.keyword({ name: "notification_url", type: ruby.Type.string() }));
            } else if (component === "MESSAGE_ID") {
                params.push(ruby.parameters.keyword({ name: "message_id", type: ruby.Type.string() }));
            }
        }
        if (config.timestamp != null) {
            params.push(ruby.parameters.keyword({ name: "timestamp_header", type: ruby.Type.string() }));
        }
        return params;
    }

    private static writeMethodBody(writer: ruby.Writer, config: FernIr.HmacSignatureVerification): void {
        // Input validation. A verification helper returns a boolean and never raises, so
        // missing inputs fail closed with `false`.
        writer.writeLine("return false if request_body.nil? || signature_header.nil? || signature_key.nil?");

        if (config.timestamp != null) {
            writer.newLine();
            WebhooksHelperGenerator.writeTimestampValidation(writer, config.timestamp);
        }

        const signatureExpr = WebhooksHelperGenerator.writeSignatureExtraction(writer, config.signaturePrefix);

        // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent
        // about the signed URL's port and query encoding, so verify against several
        // normalized URL forms and accept on the first constant-time match.
        if (config.notificationUrlNormalization != null) {
            WebhooksHelperGenerator.writeNormalizedVerification(
                writer,
                config,
                signatureExpr,
                config.notificationUrlNormalization
            );
            return;
        }

        writer.newLine();
        if (config.bodyHashBinding != null) {
            // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic
            // form-encoded and JSON requests, so branch at runtime on whether the
            // body-hash query parameter is present in the notification URL.
            //   - present (JSON): the signed payload is the URL only; additionally
            //     recompute hash(rawBody) and constant-time compare it to the transmitted
            //     value.
            //   - absent (classic form): the signed payload is the URL + sorted/deduped
            //     form params, with no body-hash check.
            WebhooksHelperGenerator.writeBodyHashBranchedPayloadConstruction(writer, config, config.bodyHashBinding);
        } else {
            WebhooksHelperGenerator.writePayloadConstruction(writer, config.payloadFormat);
        }

        writer.newLine();
        const algorithm = mapHmacAlgorithm(config.algorithm);
        const encoding = mapEncoding(config.encoding);
        writer.writeLine("expected = Internal::WebhookSignature.compute_hmac_signature(");
        writer.indent();
        writer.writeLine("payload: payload,");
        writer.writeLine("secret: signature_key,");
        writer.writeLine(`algorithm: "${algorithm}",`);
        writer.writeLine(`encoding: "${encoding}"`);
        writer.dedent();
        writer.writeLine(")");

        writer.newLine();
        writer.writeLine(`Internal::WebhookSignature.timing_safe_equal(${signatureExpr}, expected)`);
    }

    private static writeTimestampValidation(writer: ruby.Writer, timestamp: FernIr.WebhookTimestampConfig): void {
        // A missing or malformed timestamp header fails closed with `false` (the helper
        // never raises).
        writer.writeLine('return false if timestamp_header.nil? || timestamp_header == ""');
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                // Unix seconds -> milliseconds requires multiplying by 1000.
                WebhooksHelperGenerator.writeUnixTimestampParse(writer, 1000);
                break;
            case "UNIX_MILLIS":
                // Unix milliseconds are already in milliseconds, so no scaling (x1).
                WebhooksHelperGenerator.writeUnixTimestampParse(writer, 1);
                break;
            case "ISO8601":
                writer.writeLine("begin");
                writer.indent();
                writer.writeLine("timestamp_ms = (Time.iso8601(timestamp_header).to_f * 1000).to_i");
                writer.dedent();
                writer.writeLine("rescue ArgumentError");
                writer.indent();
                writer.writeLine("return false");
                writer.dedent();
                writer.writeLine("end");
                break;
            default:
                writer.writeLine("begin");
                writer.indent();
                writer.writeLine("timestamp_ms = (Time.parse(timestamp_header).to_f * 1000).to_i");
                writer.dedent();
                writer.writeLine("rescue ArgumentError");
                writer.indent();
                writer.writeLine("return false");
                writer.dedent();
                writer.writeLine("end");
                break;
        }

        writer.newLine();
        writer.writeLine("now_ms = Time.now.to_f * 1000");
        writer.writeLine("return false if (now_ms - timestamp_ms).abs > TIMESTAMP_TOLERANCE_SECONDS * 1000");
    }

    // `millisecondsPerUnit` scales the parsed timestamp into milliseconds: 1000 for a
    // value expressed in seconds, 1 for a value already in milliseconds.
    private static writeUnixTimestampParse(writer: ruby.Writer, millisecondsPerUnit: number): void {
        writer.writeLine("begin");
        writer.indent();
        writer.writeLine("timestamp_value = Integer(timestamp_header, 10)");
        writer.dedent();
        writer.writeLine("rescue ArgumentError, TypeError");
        writer.indent();
        writer.writeLine("return false");
        writer.dedent();
        writer.writeLine("end");
        if (millisecondsPerUnit === 1) {
            writer.writeLine("timestamp_ms = timestamp_value");
        } else {
            writer.writeLine(`timestamp_ms = timestamp_value * ${millisecondsPerUnit}`);
        }
    }

    private static writeSignatureExtraction(writer: ruby.Writer, signaturePrefix: string | undefined): string {
        if (signaturePrefix == null) {
            return "signature_header";
        }
        writer.newLine();
        writer.writeLine(
            "signature = signature_header.start_with?(SIGNATURE_PREFIX) ? " +
                "signature_header[SIGNATURE_PREFIX.length..] : signature_header"
        );
        return "signature";
    }

    private static writePayloadConstruction(writer: ruby.Writer, payloadFormat: FernIr.WebhookPayloadFormat): void {
        const hasBodySort = payloadFormat.bodySort != null;
        if (hasBodySort) {
            WebhooksHelperGenerator.writeBodyString(writer);
        }
        const bodyExpr = hasBodySort ? "body_string" : "request_body";
        writer.writeLine(`payload = ${WebhooksHelperGenerator.buildPayloadExpression(payloadFormat, bodyExpr)}`);
    }

    /**
     * Emits the `body_string = ...` assignment that flattens a form-parameter map into a
     * signed string. Mirrors Twilio's `toFormUrlEncodedParam`: keys are sorted (Hash keys
     * are inherently unique), and for each key the values are deduped and sorted,
     * concatenating `key + value` for every value with no delimiter between params. A raw
     * string body is passed through unchanged.
     */
    private static writeBodyString(writer: ruby.Writer): void {
        writer.writeLine("body_string = if request_body.is_a?(::Hash)");
        writer.indent();
        writer.writeLine("request_body.keys.sort.map do |key|");
        writer.indent();
        writer.writeLine("value = request_body[key]");
        writer.writeLine("values = value.is_a?(::Array) ? value : [value]");
        writer.writeLine('values.uniq.sort.map { |v| "#{key}#{v}" }.join');
        writer.dedent();
        writer.writeLine("end.join");
        writer.dedent();
        writer.writeLine("else");
        writer.indent();
        writer.writeLine("request_body");
        writer.dedent();
        writer.writeLine("end");
    }

    /**
     * Builds the RHS Ruby expression for `payload` from the configured components.
     * `urlExpr` is the identifier used for the notification-URL component — normally
     * `notification_url`, but the candidate loop substitutes `candidate_url`.
     */
    private static buildPayloadExpression(
        payloadFormat: FernIr.WebhookPayloadFormat,
        bodyExpr: string,
        urlExpr = "notification_url"
    ): string {
        const componentExprs: string[] = [];
        for (const component of payloadFormat.components) {
            switch (component) {
                case "BODY":
                    componentExprs.push(bodyExpr);
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

        // Each component expression is already a string, so a single component can be used
        // directly rather than round-tripping through an array join.
        const [first] = componentExprs;
        if (componentExprs.length === 1 && first != null) {
            return first;
        }
        const delimiter = rubyStringLiteral(payloadFormat.delimiter);
        return `[${componentExprs.join(", ")}].join(${delimiter})`;
    }

    /**
     * Emits the runtime branch for a body-hash binding. The same endpoint can receive
     * either a JSON request (body-hash query parameter present) or a classic form-encoded
     * request (absent), so the signed payload is assembled differently at runtime and only
     * the JSON path performs the separate body-hash comparison.
     */
    private static writeBodyHashBranchedPayloadConstruction(
        writer: ruby.Writer,
        config: FernIr.HmacSignatureVerification,
        binding: FernIr.WebhookBodyHashBinding
    ): void {
        const queryParameterName = WebhooksHelperGenerator.getBodyHashQueryParameterName(binding.location);
        writer.writeLine(
            `transmitted_body_hash = Internal::WebhookBodyHash.get_query_parameter(notification_url, ${rubyStringLiteral(
                queryParameterName
            )})`
        );
        writer.writeLine("payload = if transmitted_body_hash.nil?");
        writer.indent();

        // Classic form path: URL + sorted/deduped form params, no body-hash check.
        const hasBodySort = config.payloadFormat.bodySort != null;
        if (hasBodySort) {
            WebhooksHelperGenerator.writeBodyString(writer);
        }
        const bodyExpr = hasBodySort ? "body_string" : "request_body";
        writer.writeLine(WebhooksHelperGenerator.buildPayloadExpression(config.payloadFormat, bodyExpr));
        writer.dedent();
        writer.writeLine("else");
        writer.indent();

        // JSON path: the URL alone is the signed payload; the raw body is transmitted as a
        // separately-recomputed hash and compared in constant time. Both must pass.
        WebhooksHelperGenerator.writeBodyHashComparison(writer, binding);
        writer.writeLine("notification_url");
        writer.dedent();
        writer.writeLine("end");
    }

    /**
     * Emits the raw-body-hash recomputation and constant-time comparison against the
     * transmitted hash. Returns false on mismatch (the helper never raises).
     */
    private static writeBodyHashComparison(writer: ruby.Writer, binding: FernIr.WebhookBodyHashBinding): void {
        const algorithm = mapBodyHashAlgorithm(binding.algorithm);
        const encoding = mapEncoding(binding.encoding);
        writer.writeLine("expected_body_hash = Internal::WebhookBodyHash.compute_hash(");
        writer.indent();
        writer.writeLine("payload: request_body,");
        writer.writeLine(`algorithm: "${algorithm}",`);
        writer.writeLine(`encoding: "${encoding}"`);
        writer.dedent();
        writer.writeLine(")");
        writer.writeLine(
            "return false unless Internal::WebhookSignature.timing_safe_equal(expected_body_hash, transmitted_body_hash)"
        );
    }

    /**
     * Emits HMAC verification against several normalized notification-URL forms, accepting
     * on the first constant-time match. The body-hash check (when configured) runs once
     * above the loop because it does not depend on URL normalization; only the HMAC over
     * the URL is recomputed per candidate.
     */
    private static writeNormalizedVerification(
        writer: ruby.Writer,
        config: FernIr.HmacSignatureVerification,
        signatureExpr: string,
        normalization: FernIr.WebhookNotificationUrlNormalization
    ): void {
        const algorithm = mapHmacAlgorithm(config.algorithm);
        const encoding = mapEncoding(config.encoding);
        const binding = config.bodyHashBinding;
        const hasBodySort = config.payloadFormat.bodySort != null;

        writer.newLine();

        // Body-hash check (once, independent of URL normalization). Only the JSON request
        // carries the transmitted hash; when present it must match hash(rawBody).
        if (binding != null) {
            const queryParameterName = WebhooksHelperGenerator.getBodyHashQueryParameterName(binding.location);
            writer.writeLine(
                "transmitted_body_hash = Internal::WebhookBodyHash.get_query_parameter(notification_url, " +
                    `${rubyStringLiteral(queryParameterName)})`
            );
            writer.writeLine("unless transmitted_body_hash.nil?");
            writer.indent();
            WebhooksHelperGenerator.writeBodyHashComparison(writer, binding);
            writer.dedent();
            writer.writeLine("end");
        }

        // The form-path body string is URL-independent, so compute it once before the loop.
        if (hasBodySort) {
            WebhooksHelperGenerator.writeBodyString(writer);
        }

        writer.writeLine("candidates = Internal::WebhookSignature.notification_url_candidates(");
        writer.indent();
        writer.writeLine("notification_url,");
        writer.writeLine(`port_variants: ${normalization.portVariants ? "true" : "false"},`);
        writer.writeLine(`legacy_query_encoding: ${normalization.legacyQueryEncoding ? "true" : "false"}`);
        writer.dedent();
        writer.writeLine(")");
        writer.writeLine("candidates.each do |candidate_url|");
        writer.indent();

        const bodyExpr = hasBodySort ? "body_string" : "request_body";
        const formPayloadExpr = WebhooksHelperGenerator.buildPayloadExpression(
            config.payloadFormat,
            bodyExpr,
            "candidate_url"
        );
        if (binding != null) {
            // JSON request signs the URL only; classic form request signs URL + params.
            writer.writeLine(`payload = transmitted_body_hash.nil? ? ${formPayloadExpr} : candidate_url`);
        } else {
            writer.writeLine(`payload = ${formPayloadExpr}`);
        }
        writer.writeLine("expected = Internal::WebhookSignature.compute_hmac_signature(");
        writer.indent();
        writer.writeLine("payload: payload,");
        writer.writeLine("secret: signature_key,");
        writer.writeLine(`algorithm: "${algorithm}",`);
        writer.writeLine(`encoding: "${encoding}"`);
        writer.dedent();
        writer.writeLine(")");
        writer.writeLine(`return true if Internal::WebhookSignature.timing_safe_equal(${signatureExpr}, expected)`);
        writer.dedent();
        writer.writeLine("end");
        writer.newLine();
        writer.writeLine("false");
    }

    private static getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return location._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: (other) => {
                throw new Error(`Unsupported webhook body-hash location: ${other.type}`);
            }
        });
    }

    private buildDocstring(config: FernIr.HmacSignatureVerification): string {
        const signatureHeader = getWireValue(config.signatureHeaderName);
        const lines: string[] = [
            "Verify an HMAC webhook signature.",
            "",
            `Extract the signature from the "${signatureHeader}" header and pass it as the signature_header parameter.`
        ];
        if (config.timestamp != null) {
            const timestampHeader = getWireValue(config.timestamp.headerName);
            lines.push(
                `Extract the timestamp from the "${timestampHeader}" header and pass it as the ` +
                    "timestamp_header parameter."
            );
        }
        if (config.payloadFormat.bodySort != null) {
            lines.push(
                "The request_body parameter accepts either a raw string or a Hash of POST body parameters " +
                    "(each value a string or an array of strings).",
                "When a Hash is provided, keys are sorted and each key's values are deduped and sorted, then " +
                    "concatenated as key-value pairs before signing."
            );
        }
        if (config.bodyHashBinding != null) {
            lines.push(
                "This helper verifies both classic form-encoded and JSON requests: it branches at runtime on " +
                    "whether the body-hash query parameter is present on the notification URL.",
                "For a JSON request the raw body is verified against that separately-transmitted hash and the " +
                    "signature is checked over the notification URL only.",
                "Pass the exact raw body as request_body and the verbatim notification URL as notification_url."
            );
        }
        if (config.notificationUrlNormalization != null) {
            lines.push(
                "The signature is verified against several normalized forms of the notification URL, succeeding " +
                    "if any candidate matches."
            );
        }
        return lines.join("\n");
    }
}

function mapBodyHashAlgorithm(algorithm: FernIr.WebhookBodyHashAlgorithm): string {
    switch (algorithm) {
        case "SHA256":
            return "sha256";
        case "SHA1":
            return "sha1";
        case "SHA384":
            return "sha384";
        case "SHA512":
            return "sha512";
        default:
            throw new Error(`Unrecognized body-hash algorithm: ${algorithm}`);
    }
}

function mapHmacAlgorithm(algorithm: FernIr.HmacAlgorithm): string {
    switch (algorithm) {
        case "SHA256":
            return "sha256";
        case "SHA1":
            return "sha1";
        case "SHA384":
            return "sha384";
        case "SHA512":
            return "sha512";
        default:
            throw new Error(`Unrecognized HMAC algorithm: ${algorithm}`);
    }
}

function mapEncoding(encoding: FernIr.WebhookSignatureEncoding): string {
    switch (encoding) {
        case "BASE64":
            return "base64";
        case "HEX":
            return "hex";
        default:
            throw new Error(`Unrecognized webhook signature encoding: ${encoding}`);
    }
}

/**
 * Renders a string as a safe Ruby double-quoted string literal, escaping
 * backslashes, quotes, and interpolation sigils so an API spec cannot inject
 * executable code into the generated helper.
 */
function rubyStringLiteral(value: string): string {
    const escaped = value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/#(?=[{$@])/g, "\\#");
    return `"${escaped}"`;
}
