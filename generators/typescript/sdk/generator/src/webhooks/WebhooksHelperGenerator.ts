import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { Scope, ts } from "ts-morph";

interface MethodBodyResult {
    fileConstants: string[];
    body: string;
}

export class WebhooksHelperGenerator {
    private readonly verification: FernIr.WebhookSignatureVerification;
    private readonly className: string;

    constructor(verification: FernIr.WebhookSignatureVerification, className = "WebhooksHelper") {
        this.verification = verification;
        this.className = className;
    }

    public writeToFile(context: FileContext): void {
        switch (this.verification.type) {
            case "hmac":
                this.writeHmacClass(context, this.verification);
                break;
            case "asymmetric":
                this.writeAsymmetricClass(context, this.verification);
                break;
            default:
                break;
        }
    }

    private writeHmacClass(context: FileContext, config: FernIr.HmacSignatureVerification): void {
        const parameters = this.buildHmacParameters(config);
        const result = this.buildHmacMethodBody(context, config);
        this.writeClass(context, parameters, result, this.buildJsDoc(config));
    }

    private writeAsymmetricClass(context: FileContext, config: FernIr.AsymmetricKeySignatureVerification): void {
        const parameters = this.buildAsymmetricParameters(config);
        const result = this.buildAsymmetricMethodBody(context, config);
        this.writeClass(context, parameters, result, this.buildAsymmetricJsDoc(config));
    }

    private writeClass(
        context: FileContext,
        parameters: Array<{ name: string; type: string }>,
        result: MethodBodyResult,
        jsDoc: string
    ): void {
        for (const constant of result.fileConstants) {
            context.sourceFile.addStatements(constant);
        }
        if (result.fileConstants.length > 0) {
            context.sourceFile.addStatements("");
        }

        context.sourceFile.addClass({
            name: this.className,
            isExported: true,
            docs: [jsDoc],
            methods: [
                {
                    name: "verifySignature",
                    isStatic: true,
                    isAsync: true,
                    scope: Scope.Public,
                    parameters: parameters.map((p) => ({
                        name: p.name,
                        type: p.type
                    })),
                    returnType: "Promise<boolean>",
                    statements: result.body
                }
            ]
        });
    }

    private buildHmacParameters(config: FernIr.HmacSignatureVerification): Array<{ name: string; type: string }> {
        const requestBodyType =
            config.payloadFormat.bodySort != null ? "string | Record<string, string | string[]>" : "string";
        const params: Array<{ name: string; type: string }> = [
            { name: "requestBody", type: requestBodyType },
            { name: "signatureHeader", type: "string" },
            { name: "signatureKey", type: "string" }
        ];
        this.addPayloadParameters(params, config.payloadFormat);
        if (config.timestamp != null) {
            params.push({ name: "timestampHeader", type: "string" });
        }
        return params;
    }

    private buildAsymmetricParameters(
        config: FernIr.AsymmetricKeySignatureVerification
    ): Array<{ name: string; type: string }> {
        const payloadFormat = config.payloadFormat;
        const hasBodySort = payloadFormat?.bodySort != null;
        const requestBodyType = hasBodySort ? "string | Record<string, string | string[]>" : "string";
        const params: Array<{ name: string; type: string }> = [
            { name: "requestBody", type: requestBodyType },
            { name: "signatureHeader", type: "string" }
        ];

        switch (config.keySource.type) {
            case "static":
                params.push({ name: "publicKey", type: "string" });
                break;
            case "jwks":
                if (config.keySource.keyIdHeader != null) {
                    params.push({ name: "keyIdHeader", type: "string | undefined" });
                }
                break;
            default:
                break;
        }

        if (payloadFormat != null) {
            this.addPayloadParameters(params, payloadFormat);
        }

        if (config.timestamp != null) {
            params.push({ name: "timestampHeader", type: "string" });
        }
        return params;
    }

    private addPayloadParameters(
        params: Array<{ name: string; type: string }>,
        payloadFormat: FernIr.WebhookPayloadFormat
    ): void {
        for (const component of payloadFormat.components) {
            switch (component) {
                case "NOTIFICATION_URL":
                    params.push({ name: "notificationUrl", type: "string" });
                    break;
                case "MESSAGE_ID":
                    params.push({ name: "messageId", type: "string" });
                    break;
                default:
                    break;
            }
        }
    }

    private buildHmacMethodBody(context: FileContext, config: FernIr.HmacSignatureVerification): MethodBodyResult {
        const fileConstants: string[] = [];
        const lines: string[] = [];

        // Input validation. A verification helper returns a boolean and never throws,
        // so missing inputs fail closed with `false` rather than raising.
        lines.push(
            "if (requestBody == null || signatureHeader == null || signatureKey == null) {",
            "    return false;",
            "}"
        );

        // Timestamp validation
        if (config.timestamp != null) {
            lines.push("");
            this.addTimestampValidation(fileConstants, lines, config.timestamp);
        }

        // Signature extraction
        const sigIdentifier = this.addSignatureExtraction(fileConstants, lines, config.signaturePrefix);

        // Notification-URL normalization: some providers (e.g. Twilio) are inconsistent
        // about the signed URL's port and query encoding, so verify against several
        // normalized URL forms and accept on the first constant-time match.
        if (config.notificationUrlNormalization != null) {
            this.addNormalizedHmacVerification(
                context,
                lines,
                config,
                sigIdentifier,
                config.notificationUrlNormalization
            );
            return { fileConstants, body: lines.join("\n") };
        }

        // Payload construction.
        lines.push("");
        if (config.bodyHashBinding != null) {
            // Body-hash binding (e.g. Twilio): the same endpoint accepts both classic
            // form-encoded and JSON requests, so branch at runtime on whether the body-hash
            // query parameter is present in the notification URL.
            //   - present (JSON): the signed payload is the URL only; additionally recompute
            //     hash(rawBody) and constant-time compare it to the transmitted value.
            //   - absent (classic form): the signed payload is the URL + sorted/deduped form
            //     params, with no body-hash check.
            this.addBodyHashBranchedPayloadConstruction(context, lines, config, config.bodyHashBinding);
        } else {
            this.addPayloadConstruction(lines, config.payloadFormat);
        }

        // HMAC computation
        lines.push("");
        const algorithm = this.mapHmacAlgorithm(config.algorithm);
        const encoding = this.mapEncoding(config.encoding);

        const argsExpr = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment("payload", ts.factory.createIdentifier("payload")),
                ts.factory.createPropertyAssignment("secret", ts.factory.createIdentifier("signatureKey")),
                ts.factory.createPropertyAssignment("algorithm", ts.factory.createStringLiteral(algorithm)),
                ts.factory.createPropertyAssignment("encoding", ts.factory.createStringLiteral(encoding))
            ],
            false
        );
        const hmacCall = context.coreUtilities.webhookCrypto.computeHmacSignature._invoke(argsExpr);
        lines.push(`const expected = ${getTextOfTsNode(hmacCall)};`);

        // Timing-safe comparison
        lines.push("");
        const compareCall = context.coreUtilities.webhookCrypto.timingSafeEqual._invoke(
            ts.factory.createIdentifier(sigIdentifier),
            ts.factory.createIdentifier("expected")
        );
        lines.push(`return ${getTextOfTsNode(compareCall)};`);

        return { fileConstants, body: lines.join("\n") };
    }

    private buildAsymmetricMethodBody(
        context: FileContext,
        config: FernIr.AsymmetricKeySignatureVerification
    ): MethodBodyResult {
        const fileConstants: string[] = [];
        const lines: string[] = [];

        // Input validation
        const requiredParams = ["requestBody", "signatureHeader"];
        if (config.keySource.type === "static") {
            requiredParams.push("publicKey");
        }
        const nullChecks = requiredParams.map((p) => `${p} == null`).join(" || ");
        lines.push(`if (${nullChecks}) {`, "    return false;", "}");

        // Timestamp validation
        if (config.timestamp != null) {
            lines.push("");
            this.addTimestampValidation(fileConstants, lines, config.timestamp);
        }

        // Signature extraction
        const sigIdentifier = this.addSignatureExtraction(fileConstants, lines, config.signaturePrefix);

        // Payload construction
        lines.push("");
        if (config.payloadFormat != null) {
            this.addPayloadConstruction(lines, config.payloadFormat);
        } else {
            lines.push("const payload = requestBody;");
        }

        const algorithm = this.mapAsymmetricAlgorithm(config.algorithm);
        const encoding = this.mapEncoding(config.encoding);

        // Key resolution
        if (config.keySource.type === "jwks") {
            lines.push("");
            const jwksUrl = config.keySource.url;
            const jwksArgs: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment("url", ts.factory.createStringLiteral(jwksUrl))
            ];
            if (config.keySource.keyIdHeader != null) {
                jwksArgs.push(ts.factory.createPropertyAssignment("keyId", ts.factory.createIdentifier("keyIdHeader")));
            }
            const jwksArgsExpr = ts.factory.createObjectLiteralExpression(jwksArgs, false);
            const fetchCall = context.coreUtilities.webhookCrypto.fetchJwks._invoke(jwksArgsExpr);
            lines.push(`const resolvedKey = await ${getTextOfTsNode(fetchCall)};`);
        }

        // Asymmetric verification
        lines.push("");
        const keyIdentifier =
            config.keySource.type === "jwks"
                ? ts.factory.createIdentifier("resolvedKey")
                : ts.factory.createIdentifier("publicKey");

        const verifyArgsExpr = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment("payload", ts.factory.createIdentifier("payload")),
                ts.factory.createPropertyAssignment("signature", ts.factory.createIdentifier(sigIdentifier)),
                ts.factory.createPropertyAssignment("publicKey", keyIdentifier),
                ts.factory.createPropertyAssignment("algorithm", ts.factory.createStringLiteral(algorithm)),
                ts.factory.createPropertyAssignment("encoding", ts.factory.createStringLiteral(encoding))
            ],
            false
        );
        const verifyCall = context.coreUtilities.webhookCrypto.verifyAsymmetricSignature._invoke(verifyArgsExpr);
        lines.push(`return ${getTextOfTsNode(verifyCall)};`);

        return { fileConstants, body: lines.join("\n") };
    }

    private addSignatureExtraction(
        fileConstants: string[],
        lines: string[],
        signaturePrefix: string | undefined
    ): string {
        if (signaturePrefix != null) {
            const prefix = JSON.stringify(signaturePrefix);
            fileConstants.push(`const SIGNATURE_PREFIX = ${prefix};`);
            lines.push(
                "",
                `const sig = signatureHeader.startsWith(SIGNATURE_PREFIX)`,
                `    ? signatureHeader.slice(SIGNATURE_PREFIX.length)`,
                `    : signatureHeader;`
            );
            return "sig";
        }
        return "signatureHeader";
    }

    private addTimestampValidation(
        fileConstants: string[],
        lines: string[],
        timestamp: FernIr.WebhookTimestampConfig
    ): void {
        const toleranceSeconds = timestamp.tolerance ?? 300;

        fileConstants.push(`const TIMESTAMP_TOLERANCE_SECONDS = ${toleranceSeconds};`);

        // A missing or malformed timestamp header fails closed with `false` (the helper
        // never throws) rather than raising.
        lines.push('if (timestampHeader == null || timestampHeader === "") {', "    return false;", "}");

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                lines.push(
                    "",
                    "const timestampValue = parseInt(timestampHeader, 10);",
                    "if (Number.isNaN(timestampValue)) {",
                    "    return false;",
                    "}",
                    "const timestampMs = timestampValue * 1000;"
                );
                break;
            case "UNIX_MILLIS":
                lines.push(
                    "",
                    "const timestampValue = parseInt(timestampHeader, 10);",
                    "if (Number.isNaN(timestampValue)) {",
                    "    return false;",
                    "}",
                    "const timestampMs = timestampValue;"
                );
                break;
            case "ISO8601":
                lines.push(
                    "",
                    "const timestampMs = new Date(timestampHeader).getTime();",
                    "if (Number.isNaN(timestampMs)) {",
                    "    return false;",
                    "}"
                );
                break;
            default:
                lines.push("", "const timestampMs = new Date(timestampHeader).getTime();");
                break;
        }

        lines.push(
            "",
            "if (Math.abs(Date.now() - timestampMs) > TIMESTAMP_TOLERANCE_SECONDS * 1000) {",
            "    return false;",
            "}"
        );
    }

    private addPayloadConstruction(lines: string[], payloadFormat: FernIr.WebhookPayloadFormat): void {
        const hasBodySort = payloadFormat.bodySort != null;

        if (hasBodySort) {
            lines.push(...this.buildBodyStringAssignment(""));
        }

        const bodyExpr = hasBodySort ? "bodyString" : "requestBody";
        lines.push(`const payload = ${this.buildPayloadExpression(payloadFormat, bodyExpr)};`);
    }

    /**
     * Emits the `const bodyString = ...` assignment that flattens a form-parameter map
     * into a signed string. Mirrors Twilio's `toFormUrlEncodedParam`: keys are sorted
     * (object keys are inherently unique), and for each key the values are deduped and
     * sorted, concatenating `key + value` for every value with no delimiter between
     * params. A raw string body is passed through unchanged. `indent` prefixes every
     * line so the block can be nested inside a branch.
     */
    private buildBodyStringAssignment(indent: string): string[] {
        return [
            `${indent}const bodyString = typeof requestBody === "string"`,
            `${indent}    ? requestBody`,
            `${indent}    : Object.keys(requestBody)`,
            `${indent}        .sort()`,
            `${indent}        .map((key) => {`,
            `${indent}            const value = requestBody[key];`,
            `${indent}            const values = Array.isArray(value) ? value : [value];`,
            `${indent}            return Array.from(new Set(values))`,
            `${indent}                .sort()`,
            `${indent}                .map((v) => key + v)`,
            `${indent}                .join("");`,
            `${indent}        })`,
            `${indent}        .join("");`
        ];
    }

    /**
     * Builds the RHS expression for `payload` from the configured components.
     * `urlExpr` is the identifier used for the notification-URL component — normally
     * `"notificationUrl"`, but the candidate loop substitutes `"candidateUrl"`.
     */
    private buildPayloadExpression(
        payloadFormat: FernIr.WebhookPayloadFormat,
        bodyExpr: string,
        urlExpr = "notificationUrl"
    ): string {
        const componentExprs: string[] = [];
        for (const component of payloadFormat.components) {
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
                    break;
            }
        }

        // Each component expression is already a string, so a single component can be
        // used directly rather than round-tripping through an array join.
        if (componentExprs.length === 1 && componentExprs[0] != null) {
            return componentExprs[0];
        }

        const delimiter = JSON.stringify(payloadFormat.delimiter);
        return `[${componentExprs.join(", ")}].join(${delimiter})`;
    }

    /**
     * Emits the runtime branch for a body-hash binding. The same endpoint can receive
     * either a JSON request (body-hash query parameter present) or a classic
     * form-encoded request (absent), so the signed payload is assembled differently at
     * runtime and only the JSON path performs the separate body-hash comparison.
     */
    private addBodyHashBranchedPayloadConstruction(
        context: FileContext,
        lines: string[],
        config: FernIr.HmacSignatureVerification,
        binding: FernIr.WebhookBodyHashBinding
    ): void {
        const paramName = this.getBodyHashQueryParameterName(binding.location);
        const extractCall = context.coreUtilities.webhookCrypto.getWebhookQueryParameter._invoke(
            ts.factory.createIdentifier("notificationUrl"),
            ts.factory.createStringLiteral(paramName)
        );
        lines.push(`const transmittedBodyHash = ${getTextOfTsNode(extractCall)};`);
        lines.push("let payload: string;");
        lines.push("if (transmittedBodyHash != null) {");

        // JSON path: the URL alone is the signed payload; the raw body is transmitted as a
        // separately-recomputed hash and compared in constant time. Both must pass.
        const hasBodySort = config.payloadFormat.bodySort != null;
        const bodyHashAlgorithm = this.mapBodyHashAlgorithm(binding.algorithm);
        const bodyHashEncoding = this.mapEncoding(binding.encoding);
        // When bodySort widens requestBody to a union, narrow it to `string` for the hash
        // (the JSON path only receives a raw string body).
        const rawBodyExpr: ts.Expression = hasBodySort
            ? ts.factory.createAsExpression(
                  ts.factory.createIdentifier("requestBody"),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              )
            : ts.factory.createIdentifier("requestBody");
        const hashArgs = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment("payload", rawBodyExpr),
                ts.factory.createPropertyAssignment("algorithm", ts.factory.createStringLiteral(bodyHashAlgorithm)),
                ts.factory.createPropertyAssignment("encoding", ts.factory.createStringLiteral(bodyHashEncoding))
            ],
            false
        );
        const hashCall = context.coreUtilities.webhookCrypto.computeHash._invoke(hashArgs);
        lines.push(`    const expectedBodyHash = ${getTextOfTsNode(hashCall)};`);
        const compareCall = context.coreUtilities.webhookCrypto.timingSafeEqual._invoke(
            ts.factory.createIdentifier("expectedBodyHash"),
            ts.factory.createIdentifier("transmittedBodyHash")
        );
        lines.push(`    if (!(${getTextOfTsNode(compareCall)})) {`, "        return false;", "    }");
        lines.push("    payload = notificationUrl;");

        // Classic form path: URL + sorted/deduped form params, no body-hash check.
        lines.push("} else {");
        if (hasBodySort) {
            lines.push(...this.buildBodyStringAssignment("    "));
        }
        const bodyExpr = hasBodySort ? "bodyString" : "requestBody";
        lines.push(`    payload = ${this.buildPayloadExpression(config.payloadFormat, bodyExpr)};`);
        lines.push("}");
    }

    /**
     * Emits HMAC verification against several normalized notification-URL forms, accepting
     * on the first constant-time match. The body-hash check (when configured) runs once
     * above the loop because it does not depend on URL normalization; only the HMAC over
     * the URL is recomputed per candidate.
     */
    private addNormalizedHmacVerification(
        context: FileContext,
        lines: string[],
        config: FernIr.HmacSignatureVerification,
        sigIdentifier: string,
        normalization: FernIr.WebhookNotificationUrlNormalization
    ): void {
        const algorithm = this.mapHmacAlgorithm(config.algorithm);
        const encoding = this.mapEncoding(config.encoding);
        const binding = config.bodyHashBinding;
        const hasBodySort = config.payloadFormat.bodySort != null;

        lines.push("");

        // Body-hash check (once, independent of URL normalization). Only the JSON request
        // carries the transmitted hash; when present it must match hash(rawBody).
        if (binding != null) {
            const paramName = this.getBodyHashQueryParameterName(binding.location);
            const extractCall = context.coreUtilities.webhookCrypto.getWebhookQueryParameter._invoke(
                ts.factory.createIdentifier("notificationUrl"),
                ts.factory.createStringLiteral(paramName)
            );
            lines.push(`const transmittedBodyHash = ${getTextOfTsNode(extractCall)};`);
            lines.push("if (transmittedBodyHash != null) {");
            const rawBodyExpr: ts.Expression = hasBodySort
                ? ts.factory.createAsExpression(
                      ts.factory.createIdentifier("requestBody"),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                  )
                : ts.factory.createIdentifier("requestBody");
            const hashArgs = ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment("payload", rawBodyExpr),
                    ts.factory.createPropertyAssignment(
                        "algorithm",
                        ts.factory.createStringLiteral(this.mapBodyHashAlgorithm(binding.algorithm))
                    ),
                    ts.factory.createPropertyAssignment(
                        "encoding",
                        ts.factory.createStringLiteral(this.mapEncoding(binding.encoding))
                    )
                ],
                false
            );
            const hashCall = context.coreUtilities.webhookCrypto.computeHash._invoke(hashArgs);
            lines.push(`    const expectedBodyHash = ${getTextOfTsNode(hashCall)};`);
            const bodyCompare = context.coreUtilities.webhookCrypto.timingSafeEqual._invoke(
                ts.factory.createIdentifier("expectedBodyHash"),
                ts.factory.createIdentifier("transmittedBodyHash")
            );
            lines.push(`    if (!(${getTextOfTsNode(bodyCompare)})) {`, "        return false;", "    }");
            lines.push("}");
        }

        // The form-path body string is URL-independent, so compute it once before the loop.
        if (hasBodySort) {
            lines.push(...this.buildBodyStringAssignment(""));
        }

        // Build the candidate URL list and OR the per-candidate signature comparisons.
        const optionsExpr = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    "portVariants",
                    normalization.portVariants ? ts.factory.createTrue() : ts.factory.createFalse()
                ),
                ts.factory.createPropertyAssignment(
                    "legacyQueryEncoding",
                    normalization.legacyQueryEncoding ? ts.factory.createTrue() : ts.factory.createFalse()
                )
            ],
            false
        );
        const candidatesCall = context.coreUtilities.webhookCrypto.notificationUrlCandidates._invoke(
            ts.factory.createIdentifier("notificationUrl"),
            optionsExpr
        );
        lines.push(`const candidates = ${getTextOfTsNode(candidatesCall)};`);

        lines.push("for (const candidateUrl of candidates) {");
        const bodyExpr = hasBodySort ? "bodyString" : "requestBody";
        const formPayloadExpr = this.buildPayloadExpression(config.payloadFormat, bodyExpr, "candidateUrl");
        if (binding != null) {
            // JSON request signs the URL only; classic form request signs URL + params.
            lines.push(`    const payload = transmittedBodyHash != null ? candidateUrl : ${formPayloadExpr};`);
        } else {
            lines.push(`    const payload = ${formPayloadExpr};`);
        }
        const hmacArgs = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment("payload", ts.factory.createIdentifier("payload")),
                ts.factory.createPropertyAssignment("secret", ts.factory.createIdentifier("signatureKey")),
                ts.factory.createPropertyAssignment("algorithm", ts.factory.createStringLiteral(algorithm)),
                ts.factory.createPropertyAssignment("encoding", ts.factory.createStringLiteral(encoding))
            ],
            false
        );
        const hmacCall = context.coreUtilities.webhookCrypto.computeHmacSignature._invoke(hmacArgs);
        lines.push(`    const expected = ${getTextOfTsNode(hmacCall)};`);
        const compare = context.coreUtilities.webhookCrypto.timingSafeEqual._invoke(
            ts.factory.createIdentifier(sigIdentifier),
            ts.factory.createIdentifier("expected")
        );
        lines.push(`    if (${getTextOfTsNode(compare)}) {`, "        return true;", "    }");
        lines.push("}");
        lines.push("return false;");
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
                throw new Error(`Unrecognized HMAC algorithm: ${algorithm}`);
        }
    }

    private mapAsymmetricAlgorithm(algorithm: FernIr.AsymmetricAlgorithm): string {
        switch (algorithm) {
            case "RSA_SHA256":
                return "RSA_SHA256";
            case "RSA_SHA384":
                return "RSA_SHA384";
            case "RSA_SHA512":
                return "RSA_SHA512";
            case "ECDSA_SHA256":
                return "ECDSA_SHA256";
            case "ECDSA_SHA384":
                return "ECDSA_SHA384";
            case "ECDSA_SHA512":
                return "ECDSA_SHA512";
            case "ED25519":
                return "ED25519";
            default:
                throw new Error(`Unrecognized asymmetric algorithm: ${algorithm}`);
        }
    }

    private mapEncoding(encoding: FernIr.WebhookSignatureEncoding): string {
        switch (encoding) {
            case "BASE64":
                return "base64";
            case "HEX":
                return "hex";
            default:
                throw new Error(`Unrecognized webhook signature encoding: ${encoding}`);
        }
    }

    private buildJsDoc(config: FernIr.HmacSignatureVerification): string {
        const lines: string[] = [
            "Verify an HMAC webhook signature.",
            "",
            `Extract the signature from the "${getWireValue(config.signatureHeaderName)}" header and pass it as the signatureHeader parameter.`
        ];
        if (config.timestamp != null) {
            lines.push(
                `Extract the timestamp from the "${getWireValue(config.timestamp.headerName)}" header and pass it as the timestampHeader parameter.`
            );
        }
        if (config.payloadFormat.bodySort != null) {
            lines.push(
                "The requestBody parameter accepts either a raw string or a Record<string, string | string[]> of POST body parameters.",
                "When a Record is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing."
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

    private buildAsymmetricJsDoc(config: FernIr.AsymmetricKeySignatureVerification): string {
        const lines: string[] = [
            "Verify an asymmetric webhook signature.",
            "",
            `Extract the signature from the "${getWireValue(config.signatureHeaderName)}" header and pass it as the signatureHeader parameter.`
        ];
        if (config.keySource.type === "jwks") {
            lines.push(`Public keys are fetched from the JWKS endpoint at ${config.keySource.url}.`);
            if (config.keySource.keyIdHeader != null) {
                lines.push(
                    `Extract the key ID from the "${getWireValue(config.keySource.keyIdHeader)}" header and pass it as the keyIdHeader parameter.`
                );
            }
        }
        if (config.timestamp != null) {
            lines.push(
                `Extract the timestamp from the "${getWireValue(config.timestamp.headerName)}" header and pass it as the timestampHeader parameter.`
            );
        }
        if (config.payloadFormat?.bodySort != null) {
            lines.push(
                "The requestBody parameter accepts either a raw string or a Record<string, string | string[]> of POST body parameters.",
                "When a Record is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing."
            );
        }
        return lines.join("\n");
    }
}
