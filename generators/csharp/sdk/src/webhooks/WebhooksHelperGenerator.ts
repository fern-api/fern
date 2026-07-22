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

        // Input validation. A verification helper returns a boolean and never throws, so
        // missing inputs fail closed with `false` rather than raising.
        writer.writeLine("if (requestBody == null || signatureHeader == null || signatureKey == null)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
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

        // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent
        // about the signed URL's port and query encoding, so verify against several
        // normalized URL forms and accept on the first constant-time match.
        if (this.config.notificationUrlNormalization != null) {
            this.writeNormalizedHmacVerification(
                writer,
                webhookSignatureReference,
                signatureVar,
                this.config.notificationUrlNormalization
            );
            return;
        }

        if (this.config.bodyHashBinding != null) {
            // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic
            // form-encoded and JSON requests, so branch at runtime on whether the
            // body-hash query parameter is present in the notification URL.
            //   - present (JSON): the signed payload is the URL only; additionally
            //     recompute hash(rawBody) and constant-time compare it to the transmitted
            //     value.
            //   - absent (classic form): the signed payload is the URL + sorted/deduped
            //     form params, with no body-hash check.
            this.writeBodyHashBranchedPayload(writer, this.config.bodyHashBinding, webhookSignatureReference);
        } else {
            this.writePayload(writer);
        }
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
        // A missing or malformed timestamp header fails closed with `false` (the helper
        // never throws) rather than raising.
        writer.writeLine("if (string.IsNullOrEmpty(timestampHeader))");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
        writer.newLine();

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                writer.writeLine("if (!long.TryParse(timestampHeader, out var timestampValue))");
                writer.writeLine("{");
                writer.indent();
                writer.writeTextStatement("return false");
                writer.dedent();
                writer.writeLine("}");
                writer.writeTextStatement("var timestampMs = timestampValue * 1000L");
                break;
            case "UNIX_MILLIS":
                writer.writeLine("if (!long.TryParse(timestampHeader, out var timestampValue))");
                writer.writeLine("{");
                writer.indent();
                writer.writeTextStatement("return false");
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
                writer.writeTextStatement("return false");
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

    /**
     * Emits `var transmittedBodyHash = ...;` reading the configured body-hash query
     * parameter from the notification URL. Callers branch at runtime on whether it is
     * present (JSON request) or absent (classic form request).
     */
    private writeTransmittedBodyHashExtraction(
        writer: ast.Writer,
        bodyHashBinding: FernIr.WebhookBodyHashBinding,
        webhookSignatureReference: ast.ClassReference
    ): void {
        const queryParameterName = this.getBodyHashQueryParameterName(bodyHashBinding.location);
        writer.write("var transmittedBodyHash = ");
        writer.writeNode(webhookSignatureReference);
        writer.write(".GetQueryParameter(notificationUrl, ");
        writer.writeNode(this.csharp.string_({ string: queryParameterName }));
        writer.writeTextStatement(")");
    }

    /**
     * Emits the JSON-path body-hash comparison inside an `if (transmittedBodyHash != null)`
     * block: recompute hash(rawBody) and constant-time compare it to the transmitted
     * value, returning false on mismatch. Only the JSON request carries the transmitted
     * hash. `rawBodyExpr` is the string-typed raw body expression.
     */
    private writeBodyHashComparison(
        writer: ast.Writer,
        bodyHashBinding: FernIr.WebhookBodyHashBinding,
        webhookSignatureReference: ast.ClassReference,
        rawBodyExpr: string
    ): void {
        const algorithm = this.mapBodyHashAlgorithm(bodyHashBinding.algorithm);
        const encoding = this.mapEncoding(bodyHashBinding.encoding);

        writer.write("var expectedBodyHash = ");
        writer.writeNode(webhookSignatureReference);
        writer.writeTextStatement(`.ComputeHash(${rawBodyExpr}, "${algorithm}", "${encoding}")`);

        writer.write("if (!");
        writer.writeNode(webhookSignatureReference);
        writer.writeLine(".TimingSafeEqual(expectedBodyHash, transmittedBodyHash))");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Emits the runtime body-hash branch for the non-normalized path. The same endpoint
     * can receive either a JSON request (body-hash query parameter present) or a classic
     * form-encoded request (absent), so the signed payload is assembled differently at
     * runtime and only the JSON path performs the separate body-hash comparison.
     */
    private writeBodyHashBranchedPayload(
        writer: ast.Writer,
        bodyHashBinding: FernIr.WebhookBodyHashBinding,
        webhookSignatureReference: ast.ClassReference
    ): void {
        this.writeTransmittedBodyHashExtraction(writer, bodyHashBinding, webhookSignatureReference);
        writer.writeTextStatement("string payload");
        writer.writeLine("if (transmittedBodyHash != null)");
        writer.writeLine("{");
        writer.indent();
        // JSON path: the URL alone is the signed payload; the raw body is transmitted as a
        // separately-recomputed hash and compared in constant time. Both must pass. When
        // bodySort widens requestBody to `object`, the JSON path only receives a raw
        // string body, so narrow with a guarded cast that fails closed.
        const rawBodyExpr = this.writeRawBodyNarrowing(writer);
        this.writeBodyHashComparison(writer, bodyHashBinding, webhookSignatureReference, rawBodyExpr);
        writer.writeTextStatement("payload = notificationUrl");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("else");
        writer.writeLine("{");
        writer.indent();
        // Classic form path: URL + sorted/deduped form params, no body-hash check.
        if (this.hasBodySort()) {
            this.writeBodyStringAssignment(writer);
        }
        writer.writeTextStatement(`payload = ${this.buildPayloadExpression()}`);
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
        writer: ast.Writer,
        webhookSignatureReference: ast.ClassReference,
        signatureVar: string,
        normalization: FernIr.WebhookNotificationUrlNormalization
    ): void {
        const binding = this.config.bodyHashBinding;

        // Body-hash check (once, independent of URL normalization). Only the JSON request
        // carries the transmitted hash; when present it must match hash(rawBody).
        if (binding != null) {
            this.writeTransmittedBodyHashExtraction(writer, binding, webhookSignatureReference);
            writer.writeLine("if (transmittedBodyHash != null)");
            writer.writeLine("{");
            writer.indent();
            const rawBodyExpr = this.writeRawBodyNarrowing(writer);
            this.writeBodyHashComparison(writer, binding, webhookSignatureReference, rawBodyExpr);
            writer.dedent();
            writer.writeLine("}");
        }

        // The form-path body string is URL-independent, so compute it once before the loop.
        if (this.hasBodySort()) {
            this.writeBodyStringAssignment(writer);
        }

        const portVariants = normalization.portVariants ? "true" : "false";
        const legacyQueryEncoding = normalization.legacyQueryEncoding ? "true" : "false";
        writer.write("var candidates = ");
        writer.writeNode(webhookSignatureReference);
        writer.writeTextStatement(
            `.NotificationUrlCandidates(notificationUrl, ${portVariants}, ${legacyQueryEncoding})`
        );

        writer.writeLine("foreach (var candidateUrl in candidates)");
        writer.writeLine("{");
        writer.indent();
        const formPayloadExpr = this.buildPayloadExpression("candidateUrl");
        if (binding != null) {
            // JSON request signs the URL only; classic form request signs URL + params.
            writer.writeTextStatement(`var payload = transmittedBodyHash != null ? candidateUrl : ${formPayloadExpr}`);
        } else {
            writer.writeTextStatement(`var payload = ${formPayloadExpr}`);
        }
        writer.write("var expected = ");
        writer.writeNode(webhookSignatureReference);
        writer.writeTextStatement(
            `.ComputeHmacSignature(payload, signatureKey, "${this.mapAlgorithm(this.config.algorithm)}", ` +
                `"${this.mapEncoding(this.config.encoding)}")`
        );
        writer.write("if (");
        writer.writeNode(webhookSignatureReference);
        writer.writeLine(`.TimingSafeEqual(${signatureVar}, expected))`);
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return true");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.writeTextStatement("return false");
    }

    /**
     * Narrows the (possibly widened to `object`) requestBody to a raw string for hashing
     * and returns the identifier to use. When bodySort widened the parameter to `object`,
     * emits a guarded cast that fails closed (returns false) rather than throwing on an
     * unexpected type; otherwise requestBody is already a string and is used directly.
     */
    private writeRawBodyNarrowing(writer: ast.Writer): string {
        if (!this.hasBodySort()) {
            return "requestBody";
        }
        writer.writeLine("if (requestBody is not string rawBody)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
        return "rawBody";
    }

    private getBodyHashQueryParameterName(location: FernIr.WebhookBodyHashLocation): string {
        switch (location.type) {
            case "queryParameter":
                return location.name;
            default:
                return assertNever(location.type);
        }
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
                return assertNever(algorithm);
        }
    }

    private writePayload(writer: ast.Writer): void {
        if (this.hasBodySort()) {
            this.writeBodyStringAssignment(writer);
        }
        writer.writeTextStatement(`var payload = ${this.buildPayloadExpression()}`);
    }

    /**
     * Emits the `string bodyString = ...` flattening of a form-parameter map into a
     * signed string. Mirrors Twilio's `toFormUrlEncodedParam`: keys are sorted (map keys
     * are inherently unique), and for each key the values are deduped and sorted,
     * concatenating `key + value` for every value with no delimiter between params. A raw
     * string body is passed through unchanged.
     *
     * The (possibly widened to `object`) requestBody is narrowed at runtime: a string
     * passes through; a dictionary is flattened; any other type fails closed (`return
     * false`) rather than throwing. Returns false when it emitted a terminating
     * `return false`, so the caller knows the surrounding block is closed off.
     */
    private writeBodyStringAssignment(writer: ast.Writer): boolean {
        writer.writeLine("string bodyString;");
        writer.writeLine("if (requestBody is string bodyStringRaw)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("bodyString = bodyStringRaw");
        writer.dedent();
        writer.writeLine("}");
        // A form-parameter multimap: param -> string | collection of strings. Keys sorted;
        // per key, values deduped and sorted; key + value concatenated with no separator.
        writer.writeLine(
            "else if (requestBody is global::System.Collections.Generic.IReadOnlyDictionary<" +
                "string, object?> bodyStringMap)"
        );
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("var bodyStringBuilder = new global::System.Text.StringBuilder()");
        writer.writeLine(
            "foreach (var bodyStringKey in global::System.Linq.Enumerable.OrderBy(" +
                "bodyStringMap.Keys, bodyStringItemKey => bodyStringItemKey, " +
                "global::System.StringComparer.Ordinal))"
        );
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("var bodyStringValue = bodyStringMap[bodyStringKey]");
        writer.writeTextStatement(
            "var bodyStringValues = new global::System.Collections.Generic.SortedSet<string>(" +
                "global::System.StringComparer.Ordinal)"
        );
        writer.writeLine(
            "if (bodyStringValue is global::System.Collections.Generic.IEnumerable<string> bodyStringStringEnumerable)"
        );
        writer.writeLine("{");
        writer.indent();
        writer.writeLine("foreach (var bodyStringItem in bodyStringStringEnumerable)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("bodyStringValues.Add(bodyStringItem)");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("else if (bodyStringValue is string bodyStringSingle)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("bodyStringValues.Add(bodyStringSingle)");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("else");
        writer.writeLine("{");
        writer.indent();
        // Unexpected value type inside the map fails closed rather than throwing.
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("foreach (var bodyStringSortedValue in bodyStringValues)");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("bodyStringBuilder.Append(bodyStringKey).Append(bodyStringSortedValue)");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.writeTextStatement("bodyString = bodyStringBuilder.ToString()");
        writer.dedent();
        writer.writeLine("}");
        // An unexpected requestBody type (neither string nor dictionary) fails closed.
        writer.writeLine("else");
        writer.writeLine("{");
        writer.indent();
        writer.writeTextStatement("return false");
        writer.dedent();
        writer.writeLine("}");
        return true;
    }

    /**
     * Builds the RHS expression for `payload` from the configured components. `urlExpr` is
     * the identifier used for the notification-URL component - normally `"notificationUrl"`,
     * but the candidate loop substitutes `"candidateUrl"`.
     */
    private buildPayloadExpression(urlExpr = "notificationUrl"): string {
        const componentExpressions = this.config.payloadFormat.components
            .map((component) => this.getComponentExpression(component, urlExpr))
            .filter((expression): expression is string => expression != null);

        // Each component expression is already a string, so a single component can be used
        // directly rather than round-tripping through string.Join.
        if (componentExpressions.length === 1 && componentExpressions[0] != null) {
            return componentExpressions[0];
        }

        const delimiter = this.config.payloadFormat.delimiter;
        return `string.Join(${JSON.stringify(delimiter)}, ${componentExpressions.join(", ")})`;
    }

    private getComponentExpression(
        component: FernIr.WebhookPayloadComponent,
        urlExpr = "notificationUrl"
    ): string | undefined {
        switch (component) {
            case "BODY":
                return this.hasBodySort() ? "bodyString" : "requestBody";
            case "TIMESTAMP":
                return "timestampHeader";
            case "NOTIFICATION_URL":
                return urlExpr;
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
