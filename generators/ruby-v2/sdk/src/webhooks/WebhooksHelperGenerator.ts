import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments.js";
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

        for (const entry of overrideEntries) {
            const firstWebhookName = entry.webhookNames[0];
            if (firstWebhookName == null) {
                continue;
            }
            const className = `${this.case.pascalSafe(firstWebhookName)}WebhooksHelper`;
            files.push(
                this.buildHelperFile({
                    className,
                    filename: `${this.case.snakeSafe(className)}.rb`,
                    config: entry.config
                })
            );
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
        if (config.timestamp?.format === "ISO8601") {
            return ["time"];
        }
        return [];
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
        method.addStatement(ruby.codeblock((writer) => this.writeMethodBody(writer, config)));
        return method;
    }

    private buildParameters(config: FernIr.HmacSignatureVerification): ruby.KeywordParameter[] {
        const bodyType =
            config.payloadFormat.bodySort != null
                ? ruby.Type.union([ruby.Type.string(), ruby.Type.hash(ruby.Type.string(), ruby.Type.string())])
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

    private writeMethodBody(writer: ruby.Writer, config: FernIr.HmacSignatureVerification): void {
        writer.writeLine(
            'raise ArgumentError, "Missing required parameters for webhook signature verification" if ' +
                "request_body.nil? || signature_header.nil? || signature_key.nil?"
        );

        if (config.timestamp != null) {
            writer.newLine();
            this.writeTimestampValidation(writer, config.timestamp);
        }

        const signatureExpr = this.writeSignatureExtraction(writer, config.signaturePrefix);

        writer.newLine();
        this.writePayloadConstruction(writer, config.payloadFormat);

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

    private writeTimestampValidation(writer: ruby.Writer, timestamp: FernIr.WebhookTimestampConfig): void {
        const headerName = getWireValue(timestamp.headerName);
        writer.writeLine(
            `raise ArgumentError, ${rubyStringLiteral(
                `Missing timestamp header '${headerName}' for webhook signature verification`
            )} if timestamp_header.nil? || timestamp_header == ""`
        );
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                this.writeUnixTimestampParse(writer, "expected unix seconds", 1000);
                break;
            case "UNIX_MILLIS":
                this.writeUnixTimestampParse(writer, "expected unix milliseconds", 1);
                break;
            case "ISO8601":
                writer.writeLine("begin");
                writer.indent();
                writer.writeLine("timestamp_ms = (Time.iso8601(timestamp_header).to_f * 1000).to_i");
                writer.dedent();
                writer.writeLine("rescue ArgumentError");
                writer.indent();
                writer.writeLine('raise ArgumentError, "Invalid timestamp format: expected ISO 8601 date string"');
                writer.dedent();
                writer.writeLine("end");
                break;
            default:
                writer.writeLine("timestamp_ms = (Time.parse(timestamp_header).to_f * 1000).to_i");
                break;
        }

        writer.newLine();
        writer.writeLine("now_ms = Time.now.to_f * 1000");
        writer.writeLine("return false if (now_ms - timestamp_ms).abs > TIMESTAMP_TOLERANCE_SECONDS * 1000");
    }

    private writeUnixTimestampParse(writer: ruby.Writer, errorDescription: string, multiplier: number): void {
        writer.writeLine("begin");
        writer.indent();
        writer.writeLine("timestamp_value = Integer(timestamp_header, 10)");
        writer.dedent();
        writer.writeLine("rescue ArgumentError, TypeError");
        writer.indent();
        writer.writeLine(`raise ArgumentError, "Invalid timestamp format: ${errorDescription}"`);
        writer.dedent();
        writer.writeLine("end");
        if (multiplier === 1) {
            writer.writeLine("timestamp_ms = timestamp_value");
        } else {
            writer.writeLine(`timestamp_ms = timestamp_value * ${multiplier}`);
        }
    }

    private writeSignatureExtraction(writer: ruby.Writer, signaturePrefix: string | undefined): string {
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

    private writePayloadConstruction(writer: ruby.Writer, payloadFormat: FernIr.WebhookPayloadFormat): void {
        const hasBodySort = payloadFormat.bodySort != null;
        if (hasBodySort) {
            writer.writeLine(
                "body_string = request_body.is_a?(::Hash) ? " +
                    'request_body.keys.sort.map { |key| "#{key}#{request_body[key]}" }.join : request_body'
            );
        }
        const bodyExpr = hasBodySort ? "body_string" : "request_body";

        const components = payloadFormat.components;
        if (components.length === 1 && components[0] === "BODY") {
            writer.writeLine(`payload = ${bodyExpr}`);
            return;
        }

        const componentExprs: string[] = [];
        for (const component of components) {
            switch (component) {
                case "BODY":
                    componentExprs.push(bodyExpr);
                    break;
                case "TIMESTAMP":
                    componentExprs.push("timestamp_header");
                    break;
                case "NOTIFICATION_URL":
                    componentExprs.push("notification_url");
                    break;
                case "MESSAGE_ID":
                    componentExprs.push("message_id");
                    break;
                default:
                    break;
            }
        }
        const delimiter = rubyStringLiteral(payloadFormat.delimiter);
        writer.writeLine(`payload = [${componentExprs.join(", ")}].join(${delimiter})`);
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
                "The request_body parameter accepts either a raw string or a Hash of POST body parameters.",
                "When a Hash is provided, parameters are sorted alphabetically by key and concatenated as " +
                    "key-value pairs before signing."
            );
        }
        return lines.join("\n");
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
