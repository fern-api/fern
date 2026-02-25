import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
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

    public writeToFile(context: SdkContext): void {
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

    private writeHmacClass(context: SdkContext, config: FernIr.HmacSignatureVerification): void {
        const parameters = this.buildHmacParameters(config);
        const result = this.buildHmacMethodBody(context, config);
        this.writeClass(context, parameters, result, this.buildJsDoc(config));
    }

    private writeAsymmetricClass(context: SdkContext, config: FernIr.AsymmetricKeySignatureVerification): void {
        const parameters = this.buildAsymmetricParameters(config);
        const result = this.buildAsymmetricMethodBody(context, config);
        this.writeClass(context, parameters, result, this.buildAsymmetricJsDoc(config));
    }

    private writeClass(
        context: SdkContext,
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
        const params: Array<{ name: string; type: string }> = [
            { name: "requestBody", type: "string" },
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
        const params: Array<{ name: string; type: string }> = [
            { name: "requestBody", type: "string" },
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

    private buildHmacMethodBody(context: SdkContext, config: FernIr.HmacSignatureVerification): MethodBodyResult {
        const fileConstants: string[] = [];
        const lines: string[] = [];

        // Input validation
        lines.push(
            "if (requestBody == null || signatureHeader == null || signatureKey == null) {",
            '    throw new Error("Missing required parameters for webhook signature verification");',
            "}"
        );

        // Timestamp validation
        if (config.timestamp != null) {
            lines.push("");
            this.addTimestampValidation(fileConstants, lines, config.timestamp);
        }

        // Signature extraction
        const sigIdentifier = this.addSignatureExtraction(fileConstants, lines, config.signaturePrefix);

        // Payload construction
        lines.push("");
        this.addPayloadConstruction(lines, config.payloadFormat);

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
        context: SdkContext,
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
        lines.push(
            `if (${nullChecks}) {`,
            '    throw new Error("Missing required parameters for webhook signature verification");',
            "}"
        );

        // Timestamp validation
        if (config.timestamp != null) {
            lines.push("");
            this.addTimestampValidation(fileConstants, lines, config.timestamp);
        }

        // Signature extraction
        const sigIdentifier = this.addSignatureExtraction(fileConstants, lines, config.signaturePrefix);

        // Payload construction
        lines.push("");
        lines.push("const payload = requestBody;");

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
        const headerName = timestamp.headerName.wireValue;

        fileConstants.push(`const TIMESTAMP_TOLERANCE_SECONDS = ${toleranceSeconds};`);

        lines.push(
            'if (timestampHeader == null || timestampHeader === "") {',
            `    throw new Error("Missing timestamp header '${headerName}' for webhook signature verification");`,
            "}"
        );

        switch (timestamp.format) {
            case "UNIX_SECONDS":
                lines.push(
                    "",
                    "const timestampValue = parseInt(timestampHeader, 10);",
                    "if (Number.isNaN(timestampValue)) {",
                    '    throw new Error("Invalid timestamp format: expected unix seconds");',
                    "}",
                    "const timestampMs = timestampValue * 1000;"
                );
                break;
            case "UNIX_MILLIS":
                lines.push(
                    "",
                    "const timestampValue = parseInt(timestampHeader, 10);",
                    "if (Number.isNaN(timestampValue)) {",
                    '    throw new Error("Invalid timestamp format: expected unix milliseconds");',
                    "}",
                    "const timestampMs = timestampValue;"
                );
                break;
            case "ISO8601":
                lines.push(
                    "",
                    "const timestampMs = new Date(timestampHeader).getTime();",
                    "if (Number.isNaN(timestampMs)) {",
                    '    throw new Error("Invalid timestamp format: expected ISO 8601 date string");',
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
        if (payloadFormat.components.length === 1 && payloadFormat.components[0] === "BODY") {
            lines.push("const payload = requestBody;");
            return;
        }

        const componentExprs: string[] = [];
        for (const component of payloadFormat.components) {
            switch (component) {
                case "BODY":
                    componentExprs.push("requestBody");
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
                    break;
            }
        }

        const delimiter = JSON.stringify(payloadFormat.delimiter);
        lines.push(`const payload = [${componentExprs.join(", ")}].join(${delimiter});`);
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
            `Extract the signature from the "${config.signatureHeaderName.wireValue}" header and pass it as the signatureHeader parameter.`
        ];
        if (config.timestamp != null) {
            lines.push(
                `Extract the timestamp from the "${config.timestamp.headerName.wireValue}" header and pass it as the timestampHeader parameter.`
            );
        }
        return lines.join("\n");
    }

    private buildAsymmetricJsDoc(config: FernIr.AsymmetricKeySignatureVerification): string {
        const lines: string[] = [
            "Verify an asymmetric webhook signature.",
            "",
            `Extract the signature from the "${config.signatureHeaderName.wireValue}" header and pass it as the signatureHeader parameter.`
        ];
        if (config.keySource.type === "jwks") {
            lines.push(`Public keys are fetched from the JWKS endpoint at ${config.keySource.url}.`);
            if (config.keySource.keyIdHeader != null) {
                lines.push(
                    `Extract the key ID from the "${config.keySource.keyIdHeader.wireValue}" header and pass it as the keyIdHeader parameter.`
                );
            }
        }
        if (config.timestamp != null) {
            lines.push(
                `Extract the timestamp from the "${config.timestamp.headerName.wireValue}" header and pass it as the timestampHeader parameter.`
            );
        }
        return lines.join("\n");
    }
}
