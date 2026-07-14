import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

export declare namespace WebhooksHelperGenerator {
    interface Args {
        context: SdkGeneratorContext;
        config: FernIr.HmacSignatureVerification;
        className: string;
    }
}

/**
 * Generates a static webhook signature verification helper (e.g. `WebhooksHelper`)
 * for a single HMAC signature verification config, mirroring the TypeScript and
 * Python generators.
 */
export class WebhooksHelperGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private readonly config: FernIr.HmacSignatureVerification;
    private readonly className: string;

    constructor({ context, config, className }: WebhooksHelperGenerator.Args) {
        super(context);
        this.config = config;
        this.className = className;
    }

    public doGenerate(): CSharpFile {
        const helperReference = this.csharp.classReference({
            name: this.className,
            namespace: this.namespaces.root
        });
        const class_ = this.csharp.class_({
            reference: helperReference,
            partial: false,
            static_: true,
            access: ast.Access.Public,
            summary: "Utilities for verifying the signatures of incoming webhook requests."
        });

        if (this.config.timestamp != null) {
            class_.addField({
                name: "TimestampToleranceSeconds",
                access: ast.Access.Private,
                const_: true,
                type: this.Primitive.long,
                initializer: this.csharp.codeblock(
                    `${this.config.timestamp.tolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS}`
                )
            });
        }

        if (this.config.signaturePrefix != null) {
            class_.addField({
                name: "SignaturePrefix",
                access: ast.Access.Private,
                const_: true,
                type: this.Primitive.string,
                initializer: this.csharp.codeblock(this.csharp.string_({ string: this.config.signaturePrefix }))
            });
        }

        class_.addMethod({
            name: "VerifySignature",
            access: ast.Access.Public,
            type: ast.MethodType.STATIC,
            isAsync: false,
            return_: this.Primitive.boolean,
            parameters: this.buildParameters(),
            body: this.csharp.codeblock((writer) => this.writeBody(writer))
        });

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of(`${this.className}.cs`);
    }

    private hasBodySort(): boolean {
        return this.config.payloadFormat.bodySort != null;
    }

    private buildParameters(): ast.Parameter[] {
        const parameters: ast.Parameter[] = [
            this.csharp.parameter({
                name: "requestBody",
                type: this.hasBodySort() ? this.Primitive.object : this.Primitive.string
            }),
            this.csharp.parameter({ name: "signatureHeader", type: this.Primitive.string }),
            this.csharp.parameter({ name: "signatureKey", type: this.Primitive.string })
        ];

        // Extra payload parameters are added in the same order as the payload components,
        // matching the TypeScript `addPayloadParameters` behavior.
        for (const component of this.config.payloadFormat.components) {
            const parameterName = this.getComponentParameterName(component);
            if (parameterName != null) {
                parameters.push(this.csharp.parameter({ name: parameterName, type: this.Primitive.string }));
            }
        }

        if (this.config.timestamp != null) {
            parameters.push(this.csharp.parameter({ name: "timestampHeader", type: this.Primitive.string }));
        }

        return parameters;
    }

    private getComponentParameterName(component: FernIr.WebhookPayloadComponent): string | undefined {
        switch (component) {
            case "NOTIFICATION_URL":
                return "notificationUrl";
            case "MESSAGE_ID":
                return "messageId";
            case "BODY":
            case "TIMESTAMP":
                return undefined;
            default:
                return assertNever(component);
        }
    }

    private writeBody(writer: ast.Writer): void {
        const webhookSignatureReference = this.csharp.classReference({
            name: "WebhookSignature",
            namespace: this.namespaces.core
        });

        writer.writeLine("if (requestBody == null || signatureHeader == null || signatureKey == null)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement(
            'throw new global::System.ArgumentException("Missing required parameters for webhook signature verification")'
        );
        writer.dedent();
        writer.writeLine("}");
        writer.newLine();

        if (this.config.timestamp != null) {
            this.writeTimestampValidation(writer, this.config.timestamp);
        }

        const signatureVar = this.config.signaturePrefix != null ? "sig" : "signatureHeader";
        if (this.config.signaturePrefix != null) {
            writer.writeTextStatement(
                "var sig = signatureHeader.StartsWith(SignaturePrefix, global::System.StringComparison.Ordinal) " +
                    "? signatureHeader.Substring(SignaturePrefix.Length) : signatureHeader"
            );
            writer.newLine();
        }

        this.writePayload(writer);
        writer.newLine();

        writer.write("var expected = ");
        writer.writeNode(webhookSignatureReference);
        writer.writeTextStatement(
            `.ComputeHmacSignature(payload, signatureKey, "${this.mapAlgorithm(this.config.algorithm)}", ` +
                `"${this.mapEncoding(this.config.encoding)}")`
        );
        writer.newLine();

        writer.write(`return `);
        writer.writeNode(webhookSignatureReference);
        writer.writeTextStatement(`.TimingSafeEqual(${signatureVar}, expected)`);
    }

    private writeTimestampValidation(writer: ast.Writer, timestamp: FernIr.WebhookTimestampConfig): void {
        const headerWireValue = getWireValue(timestamp.headerName);
        writer.writeLine("if (string.IsNullOrEmpty(timestampHeader))");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement(
            `throw new global::System.ArgumentException("Missing timestamp header '${headerWireValue}' ` +
                `for webhook signature verification")`
        );
        writer.dedent();
        writer.writeLine("}");
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                writer.writeLine("if (!long.TryParse(timestampHeader, out var timestampValue))");
                writer.writeLine("{");
                writer.indent();
                writer.writeTextStatement(
                    'throw new global::System.ArgumentException("Invalid timestamp format: expected unix seconds")'
                );
                writer.dedent();
                writer.writeLine("}");
                writer.writeTextStatement("var timestampMs = timestampValue * 1000L");
                break;
            case "UNIX_MILLIS":
                writer.writeLine("if (!long.TryParse(timestampHeader, out var timestampValue))");
                writer.writeLine("{");
                writer.indent();
                writer.writeTextStatement(
                    'throw new global::System.ArgumentException("Invalid timestamp format: expected unix milliseconds")'
                );
                writer.dedent();
                writer.writeLine("}");
                writer.writeTextStatement("var timestampMs = timestampValue");
                break;
            case "ISO8601":
                writer.writeLine(
                    "if (!global::System.DateTimeOffset.TryParse(timestampHeader, " +
                        "global::System.Globalization.CultureInfo.InvariantCulture, " +
                        "global::System.Globalization.DateTimeStyles.AssumeUniversal, out var parsedTimestamp))"
                );
                writer.writeLine("{");
                writer.indent();
                writer.writeTextStatement(
                    'throw new global::System.ArgumentException("Invalid timestamp format: expected ISO 8601 date string")'
                );
                writer.dedent();
                writer.writeLine("}");
                writer.writeTextStatement("var timestampMs = parsedTimestamp.ToUnixTimeMilliseconds()");
                break;
            default:
                assertNever(timestamp.format);
        }

        writer.writeLine(
            "if (global::System.Math.Abs(global::System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - " +
                "timestampMs) > TimestampToleranceSeconds * 1000L)"
        );
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
        writer.newLine();
    }

    private writePayload(writer: ast.Writer): void {
        const components = this.config.payloadFormat.components;
        const delimiter = this.config.payloadFormat.delimiter;

        if (this.hasBodySort()) {
            writer.writeTextStatement(
                "var bodyString = requestBody is string rawBody ? rawBody : string.Concat(" +
                    "global::System.Linq.Enumerable.Select(" +
                    "global::System.Linq.Enumerable.OrderBy(" +
                    "(global::System.Collections.Generic.IEnumerable<" +
                    "global::System.Collections.Generic.KeyValuePair<string, string>>)requestBody, " +
                    "kv => kv.Key, global::System.StringComparer.Ordinal), kv => kv.Key + kv.Value))"
            );
        }

        const componentExpressions = components.map((component) => this.getComponentExpression(component));
        if (componentExpressions.length === 1 && componentExpressions[0] != null) {
            writer.writeTextStatement(`var payload = ${componentExpressions[0]}`);
            return;
        }

        const args = componentExpressions.filter((expression): expression is string => expression != null).join(", ");
        writer.writeTextStatement(`var payload = string.Join(${JSON.stringify(delimiter)}, ${args})`);
    }

    private getComponentExpression(component: FernIr.WebhookPayloadComponent): string | undefined {
        switch (component) {
            case "BODY":
                return this.hasBodySort() ? "bodyString" : "requestBody";
            case "TIMESTAMP":
                return "timestampHeader";
            case "NOTIFICATION_URL":
                return "notificationUrl";
            case "MESSAGE_ID":
                return "messageId";
            default:
                return assertNever(component);
        }
    }

    private mapAlgorithm(algorithm: FernIr.HmacAlgorithm): string {
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
                return assertNever(algorithm);
        }
    }

    private mapEncoding(encoding: FernIr.WebhookSignatureEncoding): string {
        switch (encoding) {
            case "BASE64":
                return "base64";
            case "HEX":
                return "hex";
            default:
                return assertNever(encoding);
        }
    }
}
