import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";

import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

interface WebhookVerificationEntry {
    config: FernIr.HmacSignatureVerification;
    webhookNames: [FernIr.WebhookName, ...FernIr.WebhookName[]];
}

export class WebhooksHelperGenerator {
    private readonly context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate(): GoFile[] {
        const { defaultEntry, overrideEntries } = this.collectHmacConfigs();
        if (defaultEntry == null) {
            return [];
        }

        const files: GoFile[] = [this.generateHelperFile("WebhooksHelper", defaultEntry.config)];

        for (const entry of overrideEntries) {
            const [firstWebhookName] = entry.webhookNames;
            const className = `${this.context.getClassName(firstWebhookName)}WebhooksHelper`;
            files.push(this.generateHelperFile(className, entry.config));
        }

        return files;
    }

    private collectHmacConfigs(): {
        defaultEntry: WebhookVerificationEntry | undefined;
        overrideEntries: WebhookVerificationEntry[];
    } {
        const grouped = new Map<string, WebhookVerificationEntry>();

        for (const webhookGroup of Object.values(this.context.ir.webhookGroups)) {
            for (const webhook of webhookGroup) {
                const verification = webhook.signatureVerification;
                // Asymmetric verification is out of scope; only HMAC helpers are emitted.
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
        const timestamp = config.timestamp;
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
                timestamp == null
                    ? null
                    : {
                          headerName: getWireValue(timestamp.headerName),
                          format: timestamp.format,
                          tolerance: timestamp.tolerance ?? null
                      }
        });
    }

    private generateHelperFile(className: string, config: FernIr.HmacSignatureVerification): GoFile {
        const node = new HmacHelperWriter({ context: this.context, className, config }).write();
        return new GoFile({
            node,
            directory: RelativeFilePath.of(""),
            filename: `${this.context.getFilename(className).toLowerCase()}.go`,
            packageName: this.context.getRootPackageName(),
            rootImportPath: this.context.getRootImportPath(),
            importPath: this.context.getRootImportPath(),
            customConfig: this.context.customConfig
        });
    }
}

class HmacHelperWriter {
    private readonly context: SdkGeneratorContext;
    private readonly className: string;
    private readonly config: FernIr.HmacSignatureVerification;
    private readonly hasBodySort: boolean;
    private readonly hasTimestamp: boolean;
    private readonly components: FernIr.WebhookPayloadComponent[];

    public constructor({
        context,
        className,
        config
    }: {
        context: SdkGeneratorContext;
        className: string;
        config: FernIr.HmacSignatureVerification;
    }) {
        this.context = context;
        this.className = className;
        this.config = config;
        this.hasBodySort = config.payloadFormat.bodySort != null;
        this.hasTimestamp = config.timestamp != null;
        this.components = config.payloadFormat.components;
    }

    public write(): go.CodeBlock {
        return go.codeblock((writer) => {
            const coreAlias = writer.addImport(this.context.getCoreImportPath());
            const errorsAlias = writer.addImport("errors");

            for (const line of this.buildDocComment()) {
                writer.writeLine(line);
            }
            writer.writeLine(`type ${this.className} struct{}`);
            writer.newLine();

            writer.writeLine("// VerifySignature verifies an HMAC webhook signature.");
            writer.writeLine(`func (${this.className}) VerifySignature(`);
            for (const parameter of this.buildParameters()) {
                writer.writeLine(`\t${parameter},`);
            }
            writer.writeLine(") (bool, error) {");
            this.writeBody(writer, coreAlias, errorsAlias);
            writer.writeLine("}");
        });
    }

    private buildParameters(): string[] {
        const bodyType = this.hasBodySort ? "interface{}" : "string";
        const parameters: string[] = [`requestBody ${bodyType}`, "signatureHeader string", "signatureKey string"];
        for (const component of this.components) {
            if (component === "NOTIFICATION_URL") {
                parameters.push("notificationUrl string");
            } else if (component === "MESSAGE_ID") {
                parameters.push("messageId string");
            }
        }
        // The timestamp header is needed either for timestamp validation or as a payload component.
        if (this.hasTimestamp || this.components.includes("TIMESTAMP")) {
            parameters.push("timestampHeader string");
        }
        return parameters;
    }

    private writeBody(writer: go.Writer, coreAlias: string, errorsAlias: string): void {
        const bodyNilCheck = this.hasBodySort ? "requestBody == nil" : 'requestBody == ""';
        writer.writeLine(`\tif ${bodyNilCheck} || signatureHeader == "" || signatureKey == "" {`);
        writer.writeLine(
            `\t\treturn false, ${errorsAlias}.New("Missing required parameters for webhook signature verification")`
        );
        writer.writeLine("\t}");

        if (this.hasTimestamp && this.config.timestamp != null) {
            writer.newLine();
            this.writeTimestampValidation(writer, errorsAlias, this.config.timestamp);
        }

        const signatureExpr = this.writeSignatureExtraction(writer);

        writer.newLine();
        this.writePayloadConstruction(writer);

        writer.newLine();
        const algorithm = this.mapAlgorithm(this.config.algorithm);
        const encoding = this.mapEncoding(this.config.encoding);
        writer.writeLine(
            `\texpected, err := ${coreAlias}.ComputeHmacSignature(payload, signatureKey, "${algorithm}", "${encoding}")`
        );
        writer.writeLine("\tif err != nil {");
        writer.writeLine("\t\treturn false, err");
        writer.writeLine("\t}");

        writer.newLine();
        writer.writeLine(`\treturn ${coreAlias}.TimingSafeEqual(${signatureExpr}, expected), nil`);
    }

    private writeTimestampValidation(
        writer: go.Writer,
        errorsAlias: string,
        timestamp: FernIr.WebhookTimestampConfig
    ): void {
        const headerName = getWireValue(timestamp.headerName);
        const tolerance = timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS;

        writer.writeLine('\tif timestampHeader == "" {');
        writer.writeLine(
            `\t\treturn false, ${errorsAlias}.New("Missing timestamp header '${headerName}' for webhook signature verification")`
        );
        writer.writeLine("\t}");
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS": {
                const strconvAlias = writer.addImport("strconv");
                writer.writeLine(`\ttimestampValue, err := ${strconvAlias}.ParseInt(timestampHeader, 10, 64)`);
                writer.writeLine("\tif err != nil {");
                writer.writeLine(
                    `\t\treturn false, ${errorsAlias}.New("Invalid timestamp format: expected unix seconds")`
                );
                writer.writeLine("\t}");
                writer.writeLine("\ttimestampMs := timestampValue * 1000");
                break;
            }
            case "UNIX_MILLIS": {
                const strconvAlias = writer.addImport("strconv");
                writer.writeLine(`\ttimestampValue, err := ${strconvAlias}.ParseInt(timestampHeader, 10, 64)`);
                writer.writeLine("\tif err != nil {");
                writer.writeLine(
                    `\t\treturn false, ${errorsAlias}.New("Invalid timestamp format: expected unix milliseconds")`
                );
                writer.writeLine("\t}");
                writer.writeLine("\ttimestampMs := timestampValue");
                break;
            }
            case "ISO8601": {
                const timeAlias = writer.addImport("time");
                writer.writeLine(`\tparsedTimestamp, err := ${timeAlias}.Parse(${timeAlias}.RFC3339, timestampHeader)`);
                writer.writeLine("\tif err != nil {");
                writer.writeLine(
                    `\t\treturn false, ${errorsAlias}.New("Invalid timestamp format: expected ISO 8601 date string")`
                );
                writer.writeLine("\t}");
                writer.writeLine("\ttimestampMs := parsedTimestamp.UnixMilli()");
                break;
            }
            default:
                assertNever(timestamp.format);
        }

        const timeAlias = writer.addImport("time");
        const mathAlias = writer.addImport("math");
        writer.newLine();
        writer.writeLine(
            `\tif ${mathAlias}.Abs(float64(${timeAlias}.Now().UnixMilli()-timestampMs)) > float64(${tolerance})*1000 {`
        );
        writer.writeLine("\t\treturn false, nil");
        writer.writeLine("\t}");
    }

    private writeSignatureExtraction(writer: go.Writer): string {
        if (this.config.signaturePrefix != null) {
            const stringsAlias = writer.addImport("strings");
            const prefix = JSON.stringify(this.config.signaturePrefix);
            writer.newLine();
            writer.writeLine("\tsig := signatureHeader");
            writer.writeLine(`\tif ${stringsAlias}.HasPrefix(signatureHeader, ${prefix}) {`);
            writer.writeLine(`\t\tsig = ${stringsAlias}.TrimPrefix(signatureHeader, ${prefix})`);
            writer.writeLine("\t}");
            return "sig";
        }
        return "signatureHeader";
    }

    private writePayloadConstruction(writer: go.Writer): void {
        let bodyExpr = "requestBody";
        if (this.hasBodySort) {
            const stringsAlias = writer.addImport("strings");
            const sortAlias = writer.addImport("sort");
            const fmtAlias = writer.addImport("fmt");
            writer.writeLine("\tvar bodyString string");
            writer.writeLine("\tswitch body := requestBody.(type) {");
            writer.writeLine("\tcase string:");
            writer.writeLine("\t\tbodyString = body");
            writer.writeLine("\tcase map[string]string:");
            writer.writeLine("\t\tkeys := make([]string, 0, len(body))");
            writer.writeLine("\t\tfor key := range body {");
            writer.writeLine("\t\t\tkeys = append(keys, key)");
            writer.writeLine("\t\t}");
            writer.writeLine(`\t\t${sortAlias}.Strings(keys)`);
            writer.writeLine(`\t\tvar builder ${stringsAlias}.Builder`);
            writer.writeLine("\t\tfor _, key := range keys {");
            writer.writeLine("\t\t\tbuilder.WriteString(key)");
            writer.writeLine("\t\t\tbuilder.WriteString(body[key])");
            writer.writeLine("\t\t}");
            writer.writeLine("\t\tbodyString = builder.String()");
            writer.writeLine("\tdefault:");
            writer.writeLine(`\t\treturn false, ${fmtAlias}.Errorf("unsupported request body type: %T", requestBody)`);
            writer.writeLine("\t}");
            bodyExpr = "bodyString";
        }

        if (this.components.length === 1 && this.components[0] === "BODY") {
            writer.writeLine(`\tpayload := ${bodyExpr}`);
            return;
        }

        const componentExprs: string[] = [];
        for (const component of this.components) {
            switch (component) {
                case "BODY":
                    componentExprs.push(bodyExpr);
                    break;
                case "TIMESTAMP":
                    componentExprs.push("timestampHeader");
                    break;
                case "NOTIFICATION_URL":
                    componentExprs.push("notificationUrl");
                    break;
                case "MESSAGE_ID":
                    componentExprs.push("messageId");
                    break;
                default:
                    assertNever(component);
            }
        }

        const stringsAlias = writer.addImport("strings");
        const delimiter = JSON.stringify(this.config.payloadFormat.delimiter);
        writer.writeLine(`\tpayload := ${stringsAlias}.Join([]string{${componentExprs.join(", ")}}, ${delimiter})`);
    }

    private buildDocComment(): string[] {
        const signatureHeader = getWireValue(this.config.signatureHeaderName);
        const lines: string[] = [
            `// ${this.className} verifies an HMAC webhook signature.`,
            "//",
            `// Extract the signature from the "${signatureHeader}" header and pass it as the signatureHeader parameter.`
        ];
        if (this.config.timestamp != null) {
            const timestampHeader = getWireValue(this.config.timestamp.headerName);
            lines.push(
                `// Extract the timestamp from the "${timestampHeader}" header and pass it as the timestampHeader parameter.`
            );
        }
        if (this.hasBodySort) {
            lines.push(
                "// The requestBody parameter accepts either a raw string or a map[string]string of POST body parameters.",
                "// When a map is provided, parameters are sorted alphabetically by key and concatenated as key-value pairs before signing."
            );
        }
        return lines;
    }

    private mapAlgorithm(algorithm: FernIr.HmacAlgorithm): string {
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
                assertNever(algorithm);
        }
    }

    private mapEncoding(encoding: FernIr.WebhookSignatureEncoding): string {
        switch (encoding) {
            case "BASE64":
                return "base64";
            case "HEX":
                return "hex";
            default:
                assertNever(encoding);
        }
    }
}
