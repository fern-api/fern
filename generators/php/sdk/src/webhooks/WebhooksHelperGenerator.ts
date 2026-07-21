import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-base";
import type { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

interface WebhookVerificationEntry {
    config: FernIr.HmacSignatureVerification;
    webhookNames: FernIr.WebhookName[];
}

interface WebhooksHelperGeneratorContext {
    readonly ir: {
        webhookGroups: Record<FernIr.WebhookGroupId, Array<Pick<FernIr.Webhook, "name" | "signatureVerification">>>;
    };
    readonly customConfig: BasePhpCustomConfigSchema;
    readonly case: {
        pascalSafe(name: FernIr.WebhookName): string;
    };
    getRootNamespace(): string;
    getCoreNamespace(): string;
}

export class WebhooksHelperGenerator {
    public constructor(private readonly context: WebhooksHelperGeneratorContext) {}

    public generate(): PhpFile[] {
        const { defaultEntry, overrideEntries } = this.collectHmacConfigs();
        if (defaultEntry == null) {
            return [];
        }

        const files = [this.generateHelper("WebhooksHelper", defaultEntry.config)];
        for (const entry of overrideEntries) {
            const firstWebhookName = entry.webhookNames[0];
            if (firstWebhookName == null) {
                continue;
            }
            files.push(
                this.generateHelper(`${this.context.case.pascalSafe(firstWebhookName)}WebhooksHelper`, entry.config)
            );
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
                if (verification == null) {
                    continue;
                }
                switch (verification.type) {
                    case "hmac": {
                        const key = this.computeVerificationKey(verification);
                        const existing = grouped.get(key);
                        if (existing != null) {
                            existing.webhookNames.push(webhook.name);
                        } else {
                            grouped.set(key, {
                                config: verification,
                                webhookNames: [webhook.name]
                            });
                        }
                        break;
                    }
                    case "asymmetric":
                        break;
                    default:
                        assertNever(verification);
                }
            }
        }

        let defaultEntry: WebhookVerificationEntry | undefined;
        let maxCount = 0;
        for (const entry of grouped.values()) {
            if (entry.webhookNames.length > maxCount) {
                defaultEntry = entry;
                maxCount = entry.webhookNames.length;
            }
        }

        return {
            defaultEntry,
            overrideEntries: [...grouped.values()].filter((entry) => entry !== defaultEntry)
        };
    }

    private computeVerificationKey(config: FernIr.HmacSignatureVerification): string {
        return JSON.stringify({
            algorithm: config.algorithm,
            encoding: config.encoding,
            signaturePrefix: config.signaturePrefix,
            signatureHeaderName: getWireValue(config.signatureHeaderName),
            payloadFormat: {
                components: config.payloadFormat.components,
                delimiter: config.payloadFormat.delimiter,
                bodySort: config.payloadFormat.bodySort
            },
            timestamp:
                config.timestamp == null
                    ? null
                    : {
                          headerName: getWireValue(config.timestamp.headerName),
                          format: config.timestamp.format,
                          tolerance: config.timestamp.tolerance
                      },
            bodyHashBinding:
                config.bodyHashBinding == null
                    ? null
                    : {
                          algorithm: config.bodyHashBinding.algorithm,
                          encoding: config.bodyHashBinding.encoding,
                          location: config.bodyHashBinding.location
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

    private generateHelper(className: string, config: FernIr.HmacSignatureVerification): PhpFile {
        const class_ = php.class_({
            name: className,
            namespace: this.context.getRootNamespace(),
            docs: this.buildDocs(config)
        });
        class_.addMethod(
            php.method({
                name: "verifySignature",
                access: php.Access.Public,
                static_: true,
                parameters: this.buildParameters(config),
                return_: php.Type.bool(),
                body: this.buildBody(config)
            })
        );
        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private buildParameters(config: FernIr.HmacSignatureVerification): php.Parameter[] {
        const nullableString = php.Type.union([php.Type.string(), php.Type.null()]);
        // When bodySort is set the body may be a raw string or a form-parameter multimap
        // whose values are a single string or a list of strings. The union renders as the
        // native hint `string|array|null`, which accepts arrays so the runtime is_string
        // guard (not the native type system) selects the branch.
        const requestBodyType =
            config.payloadFormat.bodySort == null
                ? nullableString
                : php.Type.union([
                      php.Type.string(),
                      php.Type.map(
                          php.Type.string(),
                          php.Type.union([php.Type.string(), php.Type.array(php.Type.string())])
                      ),
                      php.Type.null()
                  ]);
        const parameters = [
            php.parameter({ name: "requestBody", type: requestBodyType }),
            php.parameter({ name: "signatureHeader", type: nullableString }),
            php.parameter({ name: "signatureKey", type: nullableString })
        ];
        for (const component of config.payloadFormat.components) {
            switch (component) {
                case "BODY":
                case "TIMESTAMP":
                    break;
                case "NOTIFICATION_URL":
                    parameters.push(php.parameter({ name: "notificationUrl", type: nullableString }));
                    break;
                case "MESSAGE_ID":
                    parameters.push(php.parameter({ name: "messageId", type: nullableString }));
                    break;
                default:
                    assertNever(component);
            }
        }
        if (config.timestamp != null || config.payloadFormat.components.includes("TIMESTAMP")) {
            parameters.push(php.parameter({ name: "timestampHeader", type: nullableString }));
        }
        return parameters;
    }

    private buildBody(config: FernIr.HmacSignatureVerification): php.CodeBlock {
        return php.codeblock((writer) => {
            // A verification helper returns a boolean and never throws, so missing inputs
            // fail closed with `false` rather than raising.
            const emptyRequestBodyCheck =
                config.payloadFormat.bodySort == null
                    ? "$requestBody === null || $requestBody === ''"
                    : "$requestBody === null || $requestBody === '' || $requestBody === []";
            writer.writeLine(
                `if (${emptyRequestBodyCheck} || $signatureHeader === null || $signatureHeader === '' || $signatureKey === null || $signatureKey === '') {`
            );
            writer.indent();
            writer.writeLine("return false;");
            writer.dedent();
            writer.writeLine("}");

            if (config.timestamp != null) {
                writer.newLine();
                this.writeTimestampValidation(writer, config.timestamp);
            }

            if (config.signaturePrefix != null) {
                writer.newLine();
                writer.writeLine(`$signaturePrefix = ${this.phpString(config.signaturePrefix)};`);
                writer.writeLine("$signature = str_starts_with($signatureHeader, $signaturePrefix)");
                writer.indent();
                writer.writeLine("? substr($signatureHeader, strlen($signaturePrefix))");
                writer.writeLine(": $signatureHeader;");
                writer.dedent();
            } else {
                writer.newLine();
                writer.writeLine("$signature = $signatureHeader;");
            }

            // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent
            // about the signed URL's port and query encoding, so verify against several
            // normalized URL forms and accept on the first constant-time match.
            if (config.notificationUrlNormalization != null) {
                this.writeNormalizedHmacVerification(writer, config, config.notificationUrlNormalization);
                return;
            }

            writer.newLine();
            if (config.bodyHashBinding != null) {
                // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic
                // form-encoded and JSON requests, so branch at runtime on whether the
                // body-hash query parameter is present in the notification URL.
                //   - present (JSON): the signed payload is the URL only; additionally
                //     recompute hash(rawBody) and constant-time compare it to the
                //     transmitted value.
                //   - absent (classic form): the signed payload is the URL + sorted/deduped
                //     form params, with no body-hash check.
                this.writeBodyHashBranchedPayloadConstruction(writer, config, config.bodyHashBinding);
            } else {
                this.writePayloadConstruction(writer, config.payloadFormat);
            }

            writer.newLine();
            this.writeHmacComputation(writer, config, "$payload");

            writer.newLine();
            writer.write("return ");
            writer.writeNode(this.webhookSignatureReference());
            writer.writeLine("::timingSafeEqual($signature, $expected);");
        });
    }

    private webhookSignatureReference(): php.ClassReference {
        return php.classReference({
            name: "WebhookSignature",
            namespace: this.context.getCoreNamespace()
        });
    }

    private writeHmacComputation(
        writer: php.Writer,
        config: FernIr.HmacSignatureVerification,
        payloadExpression: string
    ): void {
        writer.write("$expected = ");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine("::computeHmacSignature(");
        writer.indent();
        writer.writeLine(`payload: ${payloadExpression},`);
        writer.writeLine("secret: $signatureKey,");
        writer.writeLine(`algorithm: ${this.phpString(this.mapHmacAlgorithm(config.algorithm))},`);
        writer.writeLine(`encoding: ${this.phpString(this.mapEncoding(config.encoding))},`);
        writer.dedent();
        writer.writeLine(");");
    }

    private writeTimestampValidation(writer: php.Writer, timestamp: FernIr.WebhookTimestampConfig): void {
        // A missing or malformed timestamp header fails closed with `false` rather than raising.
        writer.writeLine("if ($timestampHeader === null || $timestampHeader === '') {");
        writer.indent();
        writer.writeLine("return false;");
        writer.dedent();
        writer.writeLine("}");
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                this.writeUnixTimestampParsing(writer, "seconds", true);
                break;
            case "UNIX_MILLIS":
                this.writeUnixTimestampParsing(writer, "milliseconds", false);
                break;
            case "ISO8601":
                writer.writeLine("try {");
                writer.indent();
                writer.writeLine("$parsedTimestamp = new \\DateTimeImmutable($timestampHeader);");
                writer.writeLine("$timestampMs = (float) $parsedTimestamp->format('U.u') * 1000;");
                writer.dedent();
                writer.writeLine("} catch (\\Exception) {");
                writer.indent();
                writer.writeLine("return false;");
                writer.dedent();
                writer.writeLine("}");
                break;
            default:
                assertNever(timestamp.format);
        }

        writer.newLine();
        const tolerance = timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS;
        writer.writeLine(`if (abs(microtime(true) * 1000 - $timestampMs) > ${tolerance} * 1000) {`);
        writer.indent();
        writer.writeLine("return false;");
        writer.dedent();
        writer.writeLine("}");
    }

    private writeUnixTimestampParsing(writer: php.Writer, _unit: string, convertSeconds: boolean): void {
        // A missing or malformed timestamp fails closed with `false` (the helper never throws).
        writer.writeLine("$timestampValue = filter_var($timestampHeader, FILTER_VALIDATE_INT);");
        writer.writeLine("if ($timestampValue === false) {");
        writer.indent();
        writer.writeLine("return false;");
        writer.dedent();
        writer.writeLine("}");
        // Keep $timestampMs a consistent float across all timestamp formats so the abs()
        // comparison operates on a stable inferred type.
        writer.writeLine(
            convertSeconds
                ? "$timestampMs = (float) $timestampValue * 1000;"
                : "$timestampMs = (float) $timestampValue;"
        );
    }

    private writePayloadConstruction(writer: php.Writer, payloadFormat: FernIr.WebhookPayloadFormat): void {
        const hasBodySort = payloadFormat.bodySort != null;
        if (hasBodySort) {
            this.writeBodyStringAssignment(writer);
        }
        writer.writeLine(`$payload = ${this.buildPayloadExpression(payloadFormat, hasBodySort)};`);
    }

    /**
     * Emits the `$bodyString` assignment that flattens a form-parameter multimap into the
     * signed string. Mirrors Twilio's toFormUrlEncodedParam: keys are sorted, and for each
     * key the values are deduped and sorted, concatenating `key . value` for every value
     * with no delimiter between params. A raw string body is passed through unchanged.
     */
    private writeBodyStringAssignment(writer: php.Writer): void {
        writer.writeLine("if (is_string($requestBody)) {");
        writer.indent();
        writer.writeLine("$bodyString = $requestBody;");
        writer.dedent();
        writer.writeLine("} else {");
        writer.indent();
        writer.writeLine("ksort($requestBody);");
        writer.writeLine("$bodyString = '';");
        writer.writeLine("foreach ($requestBody as $key => $value) {");
        writer.indent();
        writer.writeLine("$values = is_array($value) ? $value : [$value];");
        writer.writeLine("$values = array_values(array_unique($values));");
        writer.writeLine("sort($values, SORT_STRING);");
        writer.writeLine("foreach ($values as $singleValue) {");
        writer.indent();
        writer.writeLine("$bodyString .= $key . $singleValue;");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Builds the RHS expression for `$payload`. `urlExpression` is the identifier used for
     * the notification-URL component — normally `$notificationUrl`, but the candidate loop
     * substitutes `$candidateUrl`.
     */
    private buildPayloadExpression(
        payloadFormat: FernIr.WebhookPayloadFormat,
        hasBodySort: boolean,
        urlExpression = "$notificationUrl"
    ): string {
        const bodyExpression = hasBodySort ? "$bodyString" : "$requestBody";
        const components = payloadFormat.components.map((component) => {
            switch (component) {
                case "BODY":
                    return bodyExpression;
                case "TIMESTAMP":
                    return "$timestampHeader";
                case "NOTIFICATION_URL":
                    return urlExpression;
                case "MESSAGE_ID":
                    return "$messageId";
                default:
                    assertNever(component);
            }
        });
        const firstComponent = components[0];
        if (components.length === 1 && firstComponent != null) {
            return firstComponent;
        }
        return `implode(${this.phpString(payloadFormat.delimiter)}, [${components.join(", ")}])`;
    }

    /**
     * Emits the runtime branch for a body-hash binding. The same endpoint can receive
     * either a JSON request (body-hash query parameter present) or a classic form-encoded
     * request (absent), so the signed payload is assembled differently at runtime and only
     * the JSON path performs the separate body-hash comparison.
     */
    private writeBodyHashBranchedPayloadConstruction(
        writer: php.Writer,
        config: FernIr.HmacSignatureVerification,
        binding: FernIr.WebhookBodyHashBinding
    ): void {
        const hasBodySort = config.payloadFormat.bodySort != null;
        const parameterName = this.getBodyHashQueryParameterName(binding.location);
        writer.write("$transmittedBodyHash = ");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine(`::getWebhookQueryParameter($notificationUrl, ${this.phpString(parameterName)});`);

        writer.writeLine("if ($transmittedBodyHash !== null) {");
        writer.indent();
        // JSON path: the URL alone is the signed payload; the raw body is transmitted as a
        // separately-recomputed hash and compared in constant time. Both must pass.
        this.writeBodyHashCheck(writer, binding, hasBodySort);
        writer.writeLine("$payload = $notificationUrl;");
        writer.dedent();
        writer.writeLine("} else {");
        writer.indent();
        // Classic form path: URL + sorted/deduped form params, no body-hash check.
        if (hasBodySort) {
            this.writeBodyStringAssignment(writer);
        }
        writer.writeLine(`$payload = ${this.buildPayloadExpression(config.payloadFormat, hasBodySort)};`);
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Emits the constant-time body-hash comparison for the JSON path. Assumes
     * `$transmittedBodyHash` is a non-null string in scope.
     */
    private writeBodyHashCheck(writer: php.Writer, binding: FernIr.WebhookBodyHashBinding, hasBodySort: boolean): void {
        const algorithm = this.mapBodyHashAlgorithm(binding.algorithm);
        const encoding = this.mapEncoding(binding.encoding);

        // When bodySort widens $requestBody to string|array, narrow it to a string for the
        // hash: the JSON path only receives a raw string body. A non-string here fails
        // closed via the constant-time compare below.
        const rawBodyExpression = hasBodySort ? "$rawBody" : "$requestBody";
        if (hasBodySort) {
            writer.writeLine("$rawBody = is_string($requestBody) ? $requestBody : '';");
        }
        writer.write("$expectedBodyHash = ");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine(
            `::computeHash(${rawBodyExpression}, ${this.phpString(algorithm)}, ${this.phpString(encoding)});`
        );

        writer.write("if (!");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine("::timingSafeEqual($expectedBodyHash, $transmittedBodyHash)) {");
        writer.indent();
        writer.writeLine("return false;");
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Emits HMAC verification against several normalized notification-URL forms, accepting
     * on the first constant-time match. The body-hash check (when configured) runs once
     * above the loop because it does not depend on URL normalization; only the HMAC over
     * the URL is recomputed per candidate.
     */
    private writeNormalizedHmacVerification(
        writer: php.Writer,
        config: FernIr.HmacSignatureVerification,
        normalization: FernIr.WebhookNotificationUrlNormalization
    ): void {
        const binding = config.bodyHashBinding;
        const hasBodySort = config.payloadFormat.bodySort != null;

        writer.newLine();

        // Body-hash check (once, independent of URL normalization). Only the JSON request
        // carries the transmitted hash; when present it must match hash(rawBody).
        if (binding != null) {
            const parameterName = this.getBodyHashQueryParameterName(binding.location);
            writer.write("$transmittedBodyHash = ");
            writer.writeNode(this.webhookSignatureReference());
            writer.writeLine(`::getWebhookQueryParameter($notificationUrl, ${this.phpString(parameterName)});`);
            writer.writeLine("if ($transmittedBodyHash !== null) {");
            writer.indent();
            this.writeBodyHashCheck(writer, binding, hasBodySort);
            writer.dedent();
            writer.writeLine("}");
        }

        // The form-path body string is URL-independent, so compute it once before the loop.
        if (hasBodySort) {
            this.writeBodyStringAssignment(writer);
        }

        writer.write("$candidates = ");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine(
            `::notificationUrlCandidates($notificationUrl, ${normalization.portVariants ? "true" : "false"}, ${
                normalization.legacyQueryEncoding ? "true" : "false"
            });`
        );

        writer.writeLine("foreach ($candidates as $candidateUrl) {");
        writer.indent();
        const formPayloadExpression = this.buildPayloadExpression(config.payloadFormat, hasBodySort, "$candidateUrl");
        if (binding != null) {
            // JSON request signs the URL only; classic form request signs URL + params.
            writer.writeLine(`$payload = $transmittedBodyHash !== null ? $candidateUrl : ${formPayloadExpression};`);
        } else {
            writer.writeLine(`$payload = ${formPayloadExpression};`);
        }
        this.writeHmacComputation(writer, config, "$payload");
        writer.write("if (");
        writer.writeNode(this.webhookSignatureReference());
        writer.writeLine("::timingSafeEqual($signature, $expected)) {");
        writer.indent();
        writer.writeLine("return true;");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");

        writer.newLine();
        writer.writeLine("return false;");
    }

    private getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        return location._visit({
            queryParameter: (queryParameter) => queryParameter.name,
            _other: () => {
                throw new Error(`Unsupported webhook body-hash location: ${location.type}`);
            }
        });
    }

    private mapBodyHashAlgorithm(algorithm: FernIr.WebhookBodyHashAlgorithm): string {
        switch (algorithm) {
            case "SHA1":
                return "sha1";
            case "SHA256":
                return "sha256";
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
            case "SHA1":
                return "sha1";
            case "SHA256":
                return "sha256";
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

    private buildDocs(config: FernIr.HmacSignatureVerification): string {
        const lines = [
            "Verify an HMAC webhook signature.",
            "",
            `Extract the signature from the "${getWireValue(
                config.signatureHeaderName
            )}" header and pass it as the signatureHeader parameter.`
        ];
        if (config.timestamp != null) {
            lines.push(
                `Extract the timestamp from the "${getWireValue(
                    config.timestamp.headerName
                )}" header and pass it as the timestampHeader parameter.`
            );
        }
        if (config.payloadFormat.bodySort != null) {
            lines.push(
                "The requestBody parameter accepts either a raw string or an array of POST body parameters.",
                "When an array is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing."
            );
        }
        if (config.bodyHashBinding != null) {
            lines.push(
                "This helper verifies both classic form-encoded and JSON requests: it branches at runtime on whether the body-hash query parameter is present on the notification URL.",
                "For a JSON request the raw body is verified against that separately-transmitted hash and the signature is checked over the notification URL only.",
                "Pass the exact raw body as requestBody and the verbatim notification URL as notificationUrl."
            );
        }
        if (config.notificationUrlNormalization != null) {
            lines.push(
                "The signature is verified against several normalized forms of the notification URL, succeeding if any candidate matches."
            );
        }
        return lines.join("\n");
    }

    private phpString(value: string): string {
        return `"${php.escapePhpString(value)}"`;
    }
}
