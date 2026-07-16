import { getWireValue } from "@fern-api/base-generator";
import { assertNever, visitDiscriminatedUnion } from "@fern-api/core-utils";
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

        const files: GoFile[] = [];
        this.addHelperFiles(files, "WebhooksHelper", defaultEntry.config);

        for (const entry of overrideEntries) {
            const [firstWebhookName] = entry.webhookNames;
            const className = `${this.context.getClassName(firstWebhookName)}WebhooksHelper`;
            this.addHelperFiles(files, className, entry.config);
        }

        return files;
    }

    private addHelperFiles(files: GoFile[], className: string, config: FernIr.HmacSignatureVerification): void {
        files.push(this.generateHelperFile(className, config));
        if (config.bodyHashBinding != null) {
            files.push(this.generateBodyHashHelperTestFile(className, config));
        }
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
            bodyHashBinding:
                config.bodyHashBinding == null
                    ? null
                    : {
                          algorithm: config.bodyHashBinding.algorithm,
                          encoding: config.bodyHashBinding.encoding,
                          queryParameterName: this.getBodyHashQueryParameterName(config.bodyHashBinding.location)
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

    private getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return visitDiscriminatedUnion(location)._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: () => {
                throw new Error(`Unsupported webhook body-hash location: ${location.type}`);
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

    private generateBodyHashHelperTestFile(className: string, config: FernIr.HmacSignatureVerification): GoFile {
        const node = new BodyHashHelperTestWriter({ context: this.context, className, config }).write();
        return new GoFile({
            node,
            directory: RelativeFilePath.of(""),
            filename: `${this.context.getFilename(className).toLowerCase()}_test.go`,
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
        const bodyType = this.config.bodyHashBinding != null ? "string" : this.hasBodySort ? "interface{}" : "string";
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

        if (this.config.bodyHashBinding != null) {
            writer.newLine();
            this.writeBodyHashVerification(writer, coreAlias, this.config.bodyHashBinding);
        }

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

    private writeBodyHashVerification(
        writer: go.Writer,
        coreAlias: string,
        binding: FernIr.WebhookBodyHashBinding
    ): void {
        const algorithm = this.mapBodyHashAlgorithm(binding.algorithm);
        const encoding = this.mapEncoding(binding.encoding);
        const queryParameterName = this.getBodyHashQueryParameterName(binding.location);

        writer.writeLine(
            `\texpectedBodyHash, err := ${coreAlias}.ComputeHash(requestBody, "${algorithm}", "${encoding}")`
        );
        writer.writeLine("\tif err != nil {");
        writer.writeLine("\t\treturn false, err");
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine(
            `\ttransmittedBodyHash, ok := ${coreAlias}.GetWebhookQueryParameter(notificationUrl, ${JSON.stringify(queryParameterName)})`
        );
        writer.writeLine(`\tif !ok || !${coreAlias}.TimingSafeEqual(expectedBodyHash, transmittedBodyHash) {`);
        writer.writeLine("\t\treturn false, nil");
        writer.writeLine("\t}");
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
        if (this.config.bodyHashBinding != null) {
            lines.push(
                "// Pass the exact raw body as requestBody and the verbatim notification URL as notificationUrl."
            );
        }
        return lines;
    }

    private getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return visitDiscriminatedUnion(location)._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: () => {
                throw new Error(`Unsupported webhook body-hash location: ${location.type}`);
            }
        });
    }

    private mapBodyHashAlgorithm(algorithm: FernIr.WebhookBodyHashAlgorithm): string {
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

class BodyHashHelperTestWriter {
    private readonly context: SdkGeneratorContext;
    private readonly className: string;
    private readonly config: FernIr.HmacSignatureVerification;
    private readonly bodyHashBinding: FernIr.WebhookBodyHashBinding;
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
        const bodyHashBinding = config.bodyHashBinding;
        if (bodyHashBinding == null) {
            throw new Error("Body-hash helper tests require a body-hash binding");
        }
        this.context = context;
        this.className = className;
        this.config = config;
        this.bodyHashBinding = bodyHashBinding;
        this.components = config.payloadFormat.components;
    }

    public write(): go.CodeBlock {
        return go.codeblock((writer) => {
            const coreAlias = writer.addImport(this.context.getCoreImportPath());
            const fmtAlias = writer.addImport("fmt");
            const urlAlias = writer.addImport("net/url");
            const stringsAlias = writer.addImport("strings");
            const testingAlias = writer.addImport("testing");

            writer.writeLine(`func Test${this.className}BodyHashBinding(t *${testingAlias}.T) {`);
            writer.writeLine('\trequestBody := `{"event":"example"}`');
            writer.writeLine('\tsignatureKey := "test-secret"');
            writer.writeLine(
                `\texpectedBodyHash, err := ${coreAlias}.ComputeHash(requestBody, "${this.mapBodyHashAlgorithm(this.bodyHashBinding.algorithm)}", "${this.mapEncoding(this.bodyHashBinding.encoding)}")`
            );
            writer.writeLine("\tif err != nil {");
            writer.writeLine("\t\tt.Fatal(err)");
            writer.writeLine("\t}");
            writer.writeLine(
                `\tqueryParameterName := ${JSON.stringify(this.getBodyHashQueryParameterName(this.bodyHashBinding.location))}`
            );
            writer.writeLine(
                `\tnotificationURL := ${fmtAlias}.Sprintf("https://example.com/webhook?z=last&%s=%s&a=first%%20value", ${urlAlias}.QueryEscape(queryParameterName), ${urlAlias}.QueryEscape(expectedBodyHash))`
            );
            this.writeAdditionalParameters(writer);

            writer.newLine();
            writer.writeLine(
                `\tsign := func(t *${testingAlias}.T, requestBody string, notificationURL string, signatureKey string) string {`
            );
            this.writePayloadConstruction(writer, stringsAlias);
            writer.writeLine(
                `\t\tsignature, err := ${coreAlias}.ComputeHmacSignature(payload, signatureKey, "${this.mapHmacAlgorithm(this.config.algorithm)}", "${this.mapEncoding(this.config.encoding)}")`
            );
            writer.writeLine("\t\tif err != nil {");
            writer.writeLine("\t\t\tt.Fatal(err)");
            writer.writeLine("\t\t}");
            if (this.config.signaturePrefix != null) {
                writer.writeLine(`\t\treturn ${JSON.stringify(this.config.signaturePrefix)} + signature`);
            } else {
                writer.writeLine("\t\treturn signature");
            }
            writer.writeLine("\t}");

            writer.newLine();
            writer.writeLine(
                `\tverify := func(t *${testingAlias}.T, requestBody string, notificationURL string, signatureKey string, signatureHeader string) bool {`
            );
            writer.writeLine(`\t\tvalid, err := (${this.className}{}).VerifySignature(`);
            for (const argument of this.buildVerifyArguments()) {
                writer.writeLine(`\t\t\t${argument},`);
            }
            writer.writeLine("\t\t)");
            writer.writeLine("\t\tif err != nil {");
            writer.writeLine("\t\t\tt.Fatal(err)");
            writer.writeLine("\t\t}");
            writer.writeLine("\t\treturn valid");
            writer.writeLine("\t}");

            writer.newLine();
            writer.writeLine("\tvalidSignature := sign(t, requestBody, notificationURL, signatureKey)");
            writer.writeLine(`\tt.Run("valid body and verbatim notification URL", func(t *${testingAlias}.T) {`);
            writer.writeLine("\t\tif !verify(t, requestBody, notificationURL, signatureKey, validSignature) {");
            writer.writeLine('\t\t\tt.Fatal("expected valid body hash and signature over verbatim notification URL")');
            writer.writeLine("\t\t}");
            writer.writeLine("\t})");

            writer.newLine();
            writer.writeLine('\ttamperedBody := requestBody + " "');
            writer.writeLine(`\tt.Run("tampered raw body", func(t *${testingAlias}.T) {`);
            writer.writeLine(
                "\t\tif verify(t, tamperedBody, notificationURL, signatureKey, sign(t, tamperedBody, notificationURL, signatureKey)) {"
            );
            writer.writeLine('\t\t\tt.Fatal("expected tampered raw body to fail verification")');
            writer.writeLine("\t\t}");
            writer.writeLine("\t})");

            writer.newLine();
            writer.writeLine(
                `\ttamperedURL := ${fmtAlias}.Sprintf("https://example.com/webhook?z=last&%s=%s&a=first%%20value", ${urlAlias}.QueryEscape(queryParameterName), ${urlAlias}.QueryEscape("tampered"))`
            );
            writer.writeLine(`\tt.Run("tampered query hash", func(t *${testingAlias}.T) {`);
            writer.writeLine(
                "\t\tif verify(t, requestBody, tamperedURL, signatureKey, sign(t, requestBody, tamperedURL, signatureKey)) {"
            );
            writer.writeLine('\t\t\tt.Fatal("expected tampered query hash to fail verification")');
            writer.writeLine("\t\t}");
            writer.writeLine("\t})");

            writer.newLine();
            writer.writeLine(`\tt.Run("tampered HMAC signature", func(t *${testingAlias}.T) {`);
            writer.writeLine('\t\tif verify(t, requestBody, notificationURL, signatureKey, "tampered-signature") {');
            writer.writeLine('\t\t\tt.Fatal("expected tampered HMAC signature to fail verification")');
            writer.writeLine("\t\t}");
            writer.writeLine("\t})");

            writer.newLine();
            writer.writeLine(`\tt.Run("wrong secret", func(t *${testingAlias}.T) {`);
            writer.writeLine('\t\tif verify(t, requestBody, notificationURL, "wrong-secret", validSignature) {');
            writer.writeLine('\t\t\tt.Fatal("expected wrong secret to fail verification")');
            writer.writeLine("\t\t}");
            writer.writeLine("\t})");
            writer.writeLine("}");
        });
    }

    private writeAdditionalParameters(writer: go.Writer): void {
        if (this.components.includes("MESSAGE_ID")) {
            writer.writeLine('\tmessageID := "message-id"');
        }
        if (this.config.timestamp != null || this.components.includes("TIMESTAMP")) {
            const timeAlias = writer.addImport("time");
            const timestamp = this.config.timestamp;
            if (timestamp == null || timestamp.format === "UNIX_SECONDS") {
                const strconvAlias = writer.addImport("strconv");
                writer.writeLine(`\ttimestampHeader := ${strconvAlias}.FormatInt(${timeAlias}.Now().Unix(), 10)`);
            } else if (timestamp.format === "UNIX_MILLIS") {
                const strconvAlias = writer.addImport("strconv");
                writer.writeLine(`\ttimestampHeader := ${strconvAlias}.FormatInt(${timeAlias}.Now().UnixMilli(), 10)`);
            } else if (timestamp.format === "ISO8601") {
                writer.writeLine(`\ttimestampHeader := ${timeAlias}.Now().UTC().Format(${timeAlias}.RFC3339)`);
            } else {
                assertNever(timestamp.format);
            }
        }
    }

    private writePayloadConstruction(writer: go.Writer, stringsAlias: string): void {
        const componentExprs: string[] = [];
        for (const component of this.components) {
            switch (component) {
                case "BODY":
                    componentExprs.push("requestBody");
                    break;
                case "TIMESTAMP":
                    componentExprs.push("timestampHeader");
                    break;
                case "NOTIFICATION_URL":
                    componentExprs.push("notificationURL");
                    break;
                case "MESSAGE_ID":
                    componentExprs.push("messageID");
                    break;
                default:
                    assertNever(component);
            }
        }
        writer.writeLine(
            `\t\tpayload := ${stringsAlias}.Join([]string{${componentExprs.join(", ")}}, ${JSON.stringify(this.config.payloadFormat.delimiter)})`
        );
    }

    private buildVerifyArguments(): string[] {
        const arguments_ = ["requestBody", "signatureHeader", "signatureKey"];
        for (const component of this.components) {
            if (component === "NOTIFICATION_URL") {
                arguments_.push("notificationURL");
            } else if (component === "MESSAGE_ID") {
                arguments_.push("messageID");
            }
        }
        if (this.config.timestamp != null || this.components.includes("TIMESTAMP")) {
            arguments_.push("timestampHeader");
        }
        return arguments_;
    }

    private getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return visitDiscriminatedUnion(location)._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: () => {
                throw new Error(`Unsupported webhook body-hash location: ${location.type}`);
            }
        });
    }

    private mapBodyHashAlgorithm(algorithm: FernIr.WebhookBodyHashAlgorithm): string {
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

    private mapHmacAlgorithm(algorithm: FernIr.HmacAlgorithm): string {
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
