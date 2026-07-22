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
        const normalization = config.notificationUrlNormalization;
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
            notificationUrlNormalization:
                normalization == null
                    ? null
                    : {
                          portVariants: normalization.portVariants,
                          legacyQueryEncoding: normalization.legacyQueryEncoding
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
        // When bodySort is set, the request body accepts either a raw string or a
        // map[string][]string-shaped multimap, so it is widened to interface{}.
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
        // Input validation. A verification helper fails closed with `false` rather than
        // raising on missing inputs.
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

        // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent
        // about the signed URL's port and query encoding, so verify against several
        // normalized URL forms and accept on the first constant-time match.
        if (this.config.notificationUrlNormalization != null) {
            this.writeNormalizedVerification(
                writer,
                coreAlias,
                signatureExpr,
                this.config.notificationUrlNormalization
            );
            return;
        }

        writer.newLine();
        if (this.config.bodyHashBinding != null) {
            // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic
            // form-encoded and JSON requests, so branch at runtime on whether the
            // body-hash query parameter is present in the notification URL.
            this.writeBodyHashBranchedPayloadConstruction(writer, coreAlias, this.config.bodyHashBinding);
        } else {
            this.writePayloadConstruction(writer, "notificationUrl");
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

    /**
     * Emits the runtime branch for a body-hash binding. The same endpoint can receive
     * either a JSON request (body-hash query parameter present) or a classic
     * form-encoded request (absent), so the signed payload is assembled differently at
     * runtime and only the JSON path performs the separate body-hash comparison.
     */
    private writeBodyHashBranchedPayloadConstruction(
        writer: go.Writer,
        coreAlias: string,
        binding: FernIr.WebhookBodyHashBinding
    ): void {
        const algorithm = this.mapBodyHashAlgorithm(binding.algorithm);
        const encoding = this.mapEncoding(binding.encoding);
        const queryParameterName = this.getBodyHashQueryParameterName(binding.location);

        writer.writeLine(
            `\ttransmittedBodyHash, hasBodyHash := ${coreAlias}.GetWebhookQueryParameter(notificationUrl, ${JSON.stringify(queryParameterName)})`
        );
        writer.writeLine("\tvar payload string");
        writer.writeLine("\tif hasBodyHash {");
        // JSON path: the URL alone is the signed payload; the raw body is transmitted as
        // a separately-recomputed hash and compared in constant time. Both must pass.
        const rawBodyExpr = this.rawBodyExpression(writer);
        writer.writeLine(
            `\t\texpectedBodyHash, err := ${coreAlias}.ComputeHash(${rawBodyExpr}, "${algorithm}", "${encoding}")`
        );
        writer.writeLine("\t\tif err != nil {");
        writer.writeLine("\t\t\treturn false, err");
        writer.writeLine("\t\t}");
        writer.writeLine(`\t\tif !${coreAlias}.TimingSafeEqual(expectedBodyHash, transmittedBodyHash) {`);
        writer.writeLine("\t\t\treturn false, nil");
        writer.writeLine("\t\t}");
        writer.writeLine("\t\tpayload = notificationUrl");
        // Classic form path: URL + sorted/deduped form params, no body-hash check.
        writer.writeLine("\t} else {");
        const formPayloadExpr = this.writeFormBodyString(writer, "\t\t");
        writer.writeLine(`\t\tpayload = ${this.buildPayloadExpression(writer, formPayloadExpr, "notificationUrl")}`);
        writer.writeLine("\t}");
    }

    /**
     * Emits HMAC verification against several normalized notification-URL forms,
     * accepting on the first constant-time match. The body-hash check (when configured)
     * runs once above the loop because it does not depend on URL normalization; only the
     * HMAC over the URL is recomputed per candidate.
     */
    private writeNormalizedVerification(
        writer: go.Writer,
        coreAlias: string,
        signatureExpr: string,
        normalization: FernIr.WebhookNotificationUrlNormalization
    ): void {
        const binding = this.config.bodyHashBinding;
        const algorithm = this.mapAlgorithm(this.config.algorithm);
        const encoding = this.mapEncoding(this.config.encoding);

        writer.newLine();

        // Body-hash check (once, independent of URL normalization). Only the JSON request
        // carries the transmitted hash; when present it must match hash(rawBody).
        if (binding != null) {
            const bodyHashAlgorithm = this.mapBodyHashAlgorithm(binding.algorithm);
            const bodyHashEncoding = this.mapEncoding(binding.encoding);
            const queryParameterName = this.getBodyHashQueryParameterName(binding.location);
            writer.writeLine(
                `\ttransmittedBodyHash, hasBodyHash := ${coreAlias}.GetWebhookQueryParameter(notificationUrl, ${JSON.stringify(queryParameterName)})`
            );
            writer.writeLine("\tif hasBodyHash {");
            const rawBodyExpr = this.rawBodyExpression(writer);
            writer.writeLine(
                `\t\texpectedBodyHash, err := ${coreAlias}.ComputeHash(${rawBodyExpr}, "${bodyHashAlgorithm}", "${bodyHashEncoding}")`
            );
            writer.writeLine("\t\tif err != nil {");
            writer.writeLine("\t\t\treturn false, err");
            writer.writeLine("\t\t}");
            writer.writeLine(`\t\tif !${coreAlias}.TimingSafeEqual(expectedBodyHash, transmittedBodyHash) {`);
            writer.writeLine("\t\t\treturn false, nil");
            writer.writeLine("\t\t}");
            writer.writeLine("\t}");
        }

        // The form-path body string is URL-independent, so compute it once before the loop.
        const formBodyExpr = this.writeFormBodyString(writer, "\t");

        const portVariants = normalization.portVariants ? "true" : "false";
        const legacyQueryEncoding = normalization.legacyQueryEncoding ? "true" : "false";
        writer.writeLine(
            `\tcandidates := ${coreAlias}.NotificationUrlCandidates(notificationUrl, ${portVariants}, ${legacyQueryEncoding})`
        );
        writer.writeLine("\tfor _, candidateUrl := range candidates {");

        const formPayloadExpr = this.buildPayloadExpression(writer, formBodyExpr, "candidateUrl");
        if (binding != null) {
            // JSON request signs the URL only; classic form request signs URL + params.
            writer.writeLine("\t\tvar payload string");
            writer.writeLine("\t\tif hasBodyHash {");
            writer.writeLine("\t\t\tpayload = candidateUrl");
            writer.writeLine("\t\t} else {");
            writer.writeLine(`\t\t\tpayload = ${formPayloadExpr}`);
            writer.writeLine("\t\t}");
        } else {
            writer.writeLine(`\t\tpayload := ${formPayloadExpr}`);
        }
        writer.writeLine(
            `\t\texpected, err := ${coreAlias}.ComputeHmacSignature(payload, signatureKey, "${algorithm}", "${encoding}")`
        );
        writer.writeLine("\t\tif err != nil {");
        writer.writeLine("\t\t\treturn false, err");
        writer.writeLine("\t\t}");
        writer.writeLine(`\t\tif ${coreAlias}.TimingSafeEqual(${signatureExpr}, expected) {`);
        writer.writeLine("\t\t\treturn true, nil");
        writer.writeLine("\t\t}");
        writer.writeLine("\t}");
        writer.writeLine("\treturn false, nil");
    }

    /**
     * Narrows the (possibly widened) requestBody parameter to the raw string used for
     * the body-hash computation. The JSON path only receives a raw string body, so when
     * bodySort has widened the parameter to interface{} the string is extracted with a
     * type assertion that fails closed.
     */
    private rawBodyExpression(writer: go.Writer): string {
        if (!this.hasBodySort) {
            return "requestBody";
        }
        writer.writeLine("\t\trawBody, ok := requestBody.(string)");
        writer.writeLine("\t\tif !ok {");
        writer.writeLine("\t\t\treturn false, nil");
        writer.writeLine("\t\t}");
        return "rawBody";
    }

    private writeTimestampValidation(
        writer: go.Writer,
        errorsAlias: string,
        timestamp: FernIr.WebhookTimestampConfig
    ): void {
        const headerName = getWireValue(timestamp.headerName);
        const tolerance = timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS;

        // A missing or malformed timestamp header fails closed with `false` rather than raising.
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
                writer.writeLine("\t\treturn false, nil");
                writer.writeLine("\t}");
                writer.writeLine("\ttimestampMs := timestampValue * 1000");
                break;
            }
            case "UNIX_MILLIS": {
                const strconvAlias = writer.addImport("strconv");
                writer.writeLine(`\ttimestampValue, err := ${strconvAlias}.ParseInt(timestampHeader, 10, 64)`);
                writer.writeLine("\tif err != nil {");
                writer.writeLine("\t\treturn false, nil");
                writer.writeLine("\t}");
                writer.writeLine("\ttimestampMs := timestampValue");
                break;
            }
            case "ISO8601": {
                const timeAlias = writer.addImport("time");
                writer.writeLine(`\tparsedTimestamp, err := ${timeAlias}.Parse(${timeAlias}.RFC3339, timestampHeader)`);
                writer.writeLine("\tif err != nil {");
                writer.writeLine("\t\treturn false, nil");
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

    /**
     * Emits the non-body-hash, non-normalized payload construction: `payload := <expr>`.
     */
    private writePayloadConstruction(writer: go.Writer, urlExpr: string): void {
        const formBodyExpr = this.writeFormBodyString(writer, "\t");
        writer.writeLine(`\tpayload := ${this.buildPayloadExpression(writer, formBodyExpr, urlExpr)}`);
    }

    /**
     * Emits the block that flattens a form-parameter multimap into the signed body
     * string when bodySort is configured, mirroring Twilio's toFormUrlEncodedParam:
     * keys are sorted, and for each key the values are deduped and sorted, concatenating
     * `key + value` for every value with no delimiter between params. A raw string body
     * is passed through unchanged. Returns the identifier holding the flattened string
     * (or "requestBody" when bodySort is not configured).
     */
    private writeFormBodyString(writer: go.Writer, indent: string): string {
        if (!this.hasBodySort) {
            return "requestBody";
        }
        const stringsAlias = writer.addImport("strings");
        const sortAlias = writer.addImport("sort");
        const fmtAlias = writer.addImport("fmt");
        writer.writeLine(`${indent}var bodyString string`);
        writer.writeLine(`${indent}switch body := requestBody.(type) {`);
        writer.writeLine(`${indent}case string:`);
        writer.writeLine(`${indent}\tbodyString = body`);
        writer.writeLine(`${indent}case map[string][]string:`);
        writer.writeLine(`${indent}\tkeys := make([]string, 0, len(body))`);
        writer.writeLine(`${indent}\tfor key := range body {`);
        writer.writeLine(`${indent}\t\tkeys = append(keys, key)`);
        writer.writeLine(`${indent}\t}`);
        writer.writeLine(`${indent}\t${sortAlias}.Strings(keys)`);
        writer.writeLine(`${indent}\tvar builder ${stringsAlias}.Builder`);
        writer.writeLine(`${indent}\tfor _, key := range keys {`);
        writer.writeLine(`${indent}\t\tseen := make(map[string]struct{}, len(body[key]))`);
        writer.writeLine(`${indent}\t\tuniqueValues := make([]string, 0, len(body[key]))`);
        writer.writeLine(`${indent}\t\tfor _, value := range body[key] {`);
        writer.writeLine(`${indent}\t\t\tif _, exists := seen[value]; exists {`);
        writer.writeLine(`${indent}\t\t\t\tcontinue`);
        writer.writeLine(`${indent}\t\t\t}`);
        writer.writeLine(`${indent}\t\t\tseen[value] = struct{}{}`);
        writer.writeLine(`${indent}\t\t\tuniqueValues = append(uniqueValues, value)`);
        writer.writeLine(`${indent}\t\t}`);
        writer.writeLine(`${indent}\t\t${sortAlias}.Strings(uniqueValues)`);
        writer.writeLine(`${indent}\t\tfor _, value := range uniqueValues {`);
        writer.writeLine(`${indent}\t\t\tbuilder.WriteString(key)`);
        writer.writeLine(`${indent}\t\t\tbuilder.WriteString(value)`);
        writer.writeLine(`${indent}\t\t}`);
        writer.writeLine(`${indent}\t}`);
        writer.writeLine(`${indent}\tbodyString = builder.String()`);
        writer.writeLine(`${indent}case map[string]string:`);
        writer.writeLine(`${indent}\tkeys := make([]string, 0, len(body))`);
        writer.writeLine(`${indent}\tfor key := range body {`);
        writer.writeLine(`${indent}\t\tkeys = append(keys, key)`);
        writer.writeLine(`${indent}\t}`);
        writer.writeLine(`${indent}\t${sortAlias}.Strings(keys)`);
        writer.writeLine(`${indent}\tvar builder ${stringsAlias}.Builder`);
        writer.writeLine(`${indent}\tfor _, key := range keys {`);
        writer.writeLine(`${indent}\t\tbuilder.WriteString(key)`);
        writer.writeLine(`${indent}\t\tbuilder.WriteString(body[key])`);
        writer.writeLine(`${indent}\t}`);
        writer.writeLine(`${indent}\tbodyString = builder.String()`);
        writer.writeLine(`${indent}default:`);
        writer.writeLine(
            `${indent}\treturn false, ${fmtAlias}.Errorf("unsupported request body type: %T", requestBody)`
        );
        writer.writeLine(`${indent}}`);
        return "bodyString";
    }

    /**
     * Builds the RHS expression for `payload` from the configured components. `bodyExpr`
     * is the identifier for the BODY component and `urlExpr` for the NOTIFICATION_URL
     * component (the candidate loop substitutes "candidateUrl").
     */
    private buildPayloadExpression(writer: go.Writer, bodyExpr: string, urlExpr: string): string {
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
                    componentExprs.push(urlExpr);
                    break;
                case "MESSAGE_ID":
                    componentExprs.push("messageId");
                    break;
                default:
                    assertNever(component);
            }
        }

        // A single component is already a string and can be used directly.
        if (componentExprs.length === 1 && componentExprs[0] != null) {
            return componentExprs[0];
        }

        const stringsAlias = writer.addImport("strings");
        const delimiter = JSON.stringify(this.config.payloadFormat.delimiter);
        return `${stringsAlias}.Join([]string{${componentExprs.join(", ")}}, ${delimiter})`;
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
                "// The requestBody parameter accepts either a raw string or a map[string][]string of POST body parameters.",
                "// When a map is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing."
            );
        }
        if (this.config.bodyHashBinding != null) {
            lines.push(
                "// This helper verifies both classic form-encoded and JSON requests: it branches at runtime on whether the body-hash query parameter is present on the notification URL.",
                "// For a JSON request the raw body is verified against that separately-transmitted hash and the signature is checked over the notification URL only.",
                "// Pass the exact raw body as requestBody and the verbatim notification URL as notificationUrl."
            );
        }
        if (this.config.notificationUrlNormalization != null) {
            lines.push(
                "// The signature is verified against several normalized forms of the notification URL, succeeding if any candidate matches."
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
    private readonly hasBodySort: boolean;

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
        this.hasBodySort = config.payloadFormat.bodySort != null;
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
            this.writeSignPayloadConstruction(writer, stringsAlias, coreAlias);
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

    /**
     * The signing helper reproduces the payload the provider signed: the JSON path signs
     * the notification URL alone (a body-hash query parameter is present), while the
     * classic form path signs the URL + body. The generated verifier branches on the
     * same runtime condition, so the test signs whatever the verifier will re-derive.
     */
    private writeSignPayloadConstruction(writer: go.Writer, stringsAlias: string, coreAlias: string): void {
        const queryParameterName = this.getBodyHashQueryParameterName(this.bodyHashBinding.location);
        writer.writeLine(
            `\t\t_, hasBodyHash := ${coreAlias}.GetWebhookQueryParameter(notificationURL, ${JSON.stringify(queryParameterName)})`
        );
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
        const formPayload =
            componentExprs.length === 1
                ? componentExprs[0]
                : `${stringsAlias}.Join([]string{${componentExprs.join(", ")}}, ${JSON.stringify(this.config.payloadFormat.delimiter)})`;
        writer.writeLine("\t\tvar payload string");
        writer.writeLine("\t\tif hasBodyHash {");
        writer.writeLine("\t\t\tpayload = notificationURL");
        writer.writeLine("\t\t} else {");
        writer.writeLine(`\t\t\tpayload = ${formPayload}`);
        writer.writeLine("\t\t}");
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
