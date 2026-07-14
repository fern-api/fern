import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

interface WebhookVerificationEntry {
    config: FernIr.HmacSignatureVerification;
    webhookNames: FernIr.WebhookName[];
}

export class WebhooksHelperGenerator {
    public constructor(private readonly context: SdkGeneratorContext) {}

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
        const requestBodyType =
            config.payloadFormat.bodySort == null
                ? nullableString
                : php.Type.union([
                      php.Type.string(),
                      php.Type.map(php.Type.string(), php.Type.string()),
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
        if (config.timestamp != null) {
            parameters.push(php.parameter({ name: "timestampHeader", type: nullableString }));
        }
        return parameters;
    }

    private buildBody(config: FernIr.HmacSignatureVerification): php.CodeBlock {
        return php.codeblock((writer) => {
            const emptyRequestBodyCheck =
                config.payloadFormat.bodySort == null
                    ? "$requestBody === null || $requestBody === ''"
                    : "$requestBody === null || $requestBody === '' || $requestBody === []";
            writer.writeLine(
                `if (${emptyRequestBodyCheck} || $signatureHeader === null || $signatureHeader === '' || $signatureKey === null || $signatureKey === '') {`
            );
            writer.indent();
            writer.writeLine(
                'throw new \\InvalidArgumentException("Missing required parameters for webhook signature verification");'
            );
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

            writer.newLine();
            this.writePayloadConstruction(writer, config.payloadFormat);

            writer.newLine();
            writer.write("$expected = ");
            writer.writeNode(
                php.classReference({
                    name: "WebhookSignature",
                    namespace: this.context.getCoreNamespace()
                })
            );
            writer.writeLine("::computeHmacSignature(");
            writer.indent();
            writer.writeLine("payload: $payload,");
            writer.writeLine("secret: $signatureKey,");
            writer.writeLine(`algorithm: ${this.phpString(this.mapHmacAlgorithm(config.algorithm))},`);
            writer.writeLine(`encoding: ${this.phpString(this.mapEncoding(config.encoding))},`);
            writer.dedent();
            writer.writeLine(");");

            writer.newLine();
            writer.write("return ");
            writer.writeNode(
                php.classReference({
                    name: "WebhookSignature",
                    namespace: this.context.getCoreNamespace()
                })
            );
            writer.writeLine("::timingSafeEqual($signature, $expected);");
        });
    }

    private writeTimestampValidation(writer: php.Writer, timestamp: FernIr.WebhookTimestampConfig): void {
        const headerName = getWireValue(timestamp.headerName);
        writer.writeLine("if ($timestampHeader === null || $timestampHeader === '') {");
        writer.indent();
        writer.writeLine(
            `throw new \\InvalidArgumentException(${this.phpString(
                `Missing timestamp header '${headerName}' for webhook signature verification`
            )});`
        );
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
                writer.writeLine(
                    'throw new \\InvalidArgumentException("Invalid timestamp format: expected ISO 8601 date string");'
                );
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

    private writeUnixTimestampParsing(writer: php.Writer, unit: string, convertSeconds: boolean): void {
        writer.writeLine("$timestampValue = filter_var($timestampHeader, FILTER_VALIDATE_INT);");
        writer.writeLine("if ($timestampValue === false) {");
        writer.indent();
        writer.writeLine(
            `throw new \\InvalidArgumentException(${this.phpString(
                `Invalid timestamp format: expected unix ${unit}`
            )});`
        );
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine(convertSeconds ? "$timestampMs = $timestampValue * 1000;" : "$timestampMs = $timestampValue;");
    }

    private writePayloadConstruction(writer: php.Writer, payloadFormat: FernIr.WebhookPayloadFormat): void {
        const hasBodySort = payloadFormat.bodySort != null;
        if (hasBodySort) {
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
            writer.writeLine("$bodyString .= $key . $value;");
            writer.dedent();
            writer.writeLine("}");
            writer.dedent();
            writer.writeLine("}");
        }

        const bodyExpression = hasBodySort ? "$bodyString" : "$requestBody";
        if (payloadFormat.components.length === 1 && payloadFormat.components[0] === "BODY") {
            writer.writeLine(`$payload = ${bodyExpression};`);
            return;
        }

        const components = payloadFormat.components.map((component) => {
            switch (component) {
                case "BODY":
                    return bodyExpression;
                case "TIMESTAMP":
                    return "$timestampHeader";
                case "NOTIFICATION_URL":
                    return "$notificationUrl";
                case "MESSAGE_ID":
                    return "$messageId";
                default:
                    assertNever(component);
            }
        });
        writer.writeLine(`$payload = implode(${this.phpString(payloadFormat.delimiter)}, [${components.join(", ")}]);`);
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
                "When an array is provided, parameters are sorted alphabetically by key and concatenated as key-value pairs before signing."
            );
        }
        return lines.join("\n");
    }

    private phpString(value: string): string {
        return `"${php.escapePhpString(value)}"`;
    }
}
