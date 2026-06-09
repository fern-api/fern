import { GeneratorError, getWireValue } from "@fern-api/base-generator";
import { generateRustTypeForTypeReference } from "@fern-api/rust-model";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    Attribute,
    CodeBlock,
    Enum,
    EnumVariant,
    Expression,
    ImplBlock,
    MatchArm,
    Method,
    Module,
    Pattern,
    PrimitiveType,
    PUBLIC,
    Reference,
    Statement,
    Type,
    UseStatement
} from "@fern-api/rust-codegen";
import { BUILD_ERROR_RS } from "@fern-api/rust-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class ErrorGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public generateErrorRs(): string {
        const errorModule = new Module({
            useStatements: [
                new UseStatement({
                    path: "thiserror",
                    items: ["Error"]
                })
            ],
            enums: [this.buildErrorEnum()],
            implBlocks: [this.buildErrorImpl()]
        });

        return errorModule.toString() + "\n" + BUILD_ERROR_RS;
    }

    private buildErrorEnum(): Enum {
        const variants = this.buildAllVariants();
        const attributes = [this.createDeriveAttribute(["Error", "Debug"])];

        return new Enum({
            name: "ApiError",
            visibility: PUBLIC,
            attributes,
            variants
        });
    }

    private buildAllVariants(): EnumVariant[] {
        // Deduplicate API-specific error variants by name
        const apiVariants = this.getUniqueApiVariants();

        // Add standard framework error variants
        const standardVariants = this.getStandardVariants();

        return [...apiVariants, ...standardVariants];
    }

    private getUniqueApiVariants(): EnumVariant[] {
        const seenNames = new Set<string>();
        const variants: EnumVariant[] = [];

        Object.values(this.context.ir.errors).forEach((errorDecl) => {
            const name = this.getErrorVariantName(errorDecl);
            if (!seenNames.has(name)) {
                seenNames.add(name);
                variants.push(this.buildApiErrorVariant(errorDecl));
            }
        });

        return variants;
    }

    private getStandardVariants(): EnumVariant[] {
        const variants = [
            this.buildStandardVariant("Http", "HTTP error {status}: {message}", [
                { name: "status", type: Type.primitive(PrimitiveType.U16) },
                { name: "message", type: Type.string() }
            ]),
            this.buildStandardVariant("Network", "Network error: {0}", undefined, [
                Type.reference(new Reference({ name: "reqwest::Error" }))
            ]),
            this.buildStandardVariant("Executor", "Request executor error: {0}", undefined, [
                Type.reference(new Reference({ name: "Box<dyn std::error::Error + Send + Sync>" }))
            ]),
            this.buildStandardVariant("Serialization", "Serialization error: {0}", undefined, [
                Type.reference(new Reference({ name: "serde_json::Error" }))
            ]),
            this.buildStandardVariant("Configuration", "Configuration error: {0}", undefined, [Type.string()]),
            this.buildStandardVariant("InvalidHeader", "Invalid header value"),
            this.buildStandardVariant("RequestClone", "Could not clone request for retry"),
            this.buildStandardVariant("StreamTerminated", "SSE stream terminated"),
            this.buildStandardVariant("StreamTimeout", "SSE stream timed out waiting for next event"),
            this.buildStandardVariant("SseParseError", "SSE parse error: {0}", undefined, [Type.string()])
        ];

        if (this.context.hasWebSocketChannels()) {
            variants.push(
                this.buildStandardVariant("WebSocketError", "WebSocket error: {0}", undefined, [Type.string()])
            );
        }

        return variants;
    }

    private buildStandardVariant(
        name: string,
        errorMessage: string,
        namedFields?: Array<{ name: string; type: Type }>,
        tupleData?: Type[]
    ): EnumVariant {
        return new EnumVariant({
            name,
            attributes: [this.createErrorAttribute(errorMessage)],
            namedFields,
            data: tupleData
        });
    }

    private buildApiErrorVariant(errorDeclaration: FernIr.ErrorDeclaration): EnumVariant {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const errorMessage = this.getErrorMessage(errorDeclaration);
        const fields = this.buildErrorFields(errorDeclaration);

        return new EnumVariant({
            name: errorName,
            attributes: [this.createErrorAttribute(errorMessage)],
            namedFields: fields
        });
    }

    private buildErrorFields(errorDeclaration: FernIr.ErrorDeclaration): Array<{ name: string; type: Type }> {
        return [{ name: "message", type: Type.string() }, ...this.resolveErrorFields(errorDeclaration)];
    }

    /**
     * Derives error fields from the IR type definition when available, falling back to
     * hardcoded status-code fields otherwise. Returns fields with both the Rust field
     * name (snake_case) and the JSON wire name (camelCase from the spec).
     */
    private resolveErrorFields(errorDeclaration: FernIr.ErrorDeclaration): Array<{
        name: string;
        wireName: string;
        type: Type;
        extractionKind: "string" | "u64";
    }> {
        if (errorDeclaration.type?.type === "named") {
            const typeDecl = this.context.ir.types[errorDeclaration.type.typeId];
            if (typeDecl?.shape.type === "object") {
                return typeDecl.shape.properties
                    .filter((p) => getWireValue(p.name) !== "message")
                    .map((p) => {
                        const isAlreadyOptional =
                            p.valueType.type === "container" &&
                            (p.valueType.container.type === "optional" || p.valueType.container.type === "nullable");
                        const rustType = generateRustTypeForTypeReference(p.valueType, this.context);
                        return {
                            name: this.context.case.snakeSafe(p.name),
                            wireName: getWireValue(p.name),
                            type: isAlreadyOptional ? rustType : Type.option(rustType),
                            extractionKind: this.isU64TypeReference(p.valueType) ? ("u64" as const) : ("string" as const)
                        };
                    });
            }
        }
        return this.getStatusCodeFields(errorDeclaration.statusCode).map(({ name, wireName, type }) => ({
            name,
            wireName,
            type,
            extractionKind: (name === "retry_after_seconds" ? "u64" : "string") as "string" | "u64"
        }));
    }

    private isU64TypeReference(typeRef: FernIr.TypeReference): boolean {
        if (typeRef.type === "primitive") {
            return typeRef.primitive.v1 === "UINT_64";
        }
        if (typeRef.type === "container" && typeRef.container.type === "optional") {
            return this.isU64TypeReference(typeRef.container.optional);
        }
        return false;
    }

    private getStatusCodeFields(statusCode: number): Array<{ name: string; wireName: string; type: Type }> {
        const fieldMap: Record<number, Array<{ name: string; wireName: string; type: Type }>> = {
            400: [
                { name: "field", wireName: "field", type: Type.option(Type.string()) },
                { name: "details", wireName: "details", type: Type.option(Type.string()) }
            ],
            401: [{ name: "auth_type", wireName: "authType", type: Type.option(Type.string()) }],
            403: [
                { name: "resource", wireName: "resource", type: Type.option(Type.string()) },
                { name: "required_permission", wireName: "requiredPermission", type: Type.option(Type.string()) }
            ],
            404: [
                { name: "resource_id", wireName: "resourceId", type: Type.option(Type.string()) },
                { name: "resource_type", wireName: "resourceType", type: Type.option(Type.string()) }
            ],
            409: [{ name: "conflict_type", wireName: "conflictType", type: Type.option(Type.string()) }],
            422: [
                { name: "field", wireName: "field", type: Type.option(Type.string()) },
                { name: "validation_error", wireName: "validationError", type: Type.option(Type.string()) }
            ],
            429: [
                { name: "retry_after_seconds", wireName: "retryAfterSeconds", type: Type.option(Type.primitive(PrimitiveType.U64)) },
                { name: "limit_type", wireName: "limitType", type: Type.option(Type.string()) }
            ],
            500: [{ name: "error_id", wireName: "errorId", type: Type.option(Type.string()) }]
        };

        return fieldMap[statusCode] || [];
    }

    private buildErrorImpl(): ImplBlock {
        const fromResponseMethod = this.buildFromResponseMethod();

        return new ImplBlock({
            targetType: Type.reference(new Reference({ name: "ApiError" })),
            methods: [fromResponseMethod]
        });
    }

    private buildFromResponseMethod(): Method {
        const matchStatement = this.buildMatchStatement();
        const body = CodeBlock.fromStatements([matchStatement]);

        return new Method({
            name: "from_response",
            visibility: PUBLIC,
            parameters: [
                {
                    name: "status_code",
                    parameterType: Type.primitive(PrimitiveType.U16)
                },
                {
                    name: "body",
                    parameterType: Type.option(Type.reference(new Reference({ name: "&str" })))
                }
            ],
            returnType: Type.reference(new Reference({ name: "Self" })),
            body
        });
    }

    private buildMatchStatement(): Statement {
        const arms = this.buildMatchArms();
        return Statement.matchEnhanced(Expression.variable("status_code"), arms);
    }

    private buildMatchArms(): MatchArm[] {
        const errorsByStatusCode = this.groupErrorsByStatusCode();

        const arms = Array.from(errorsByStatusCode.entries()).map(([statusCode, errors]) => {
            if (errors.length === 1) {
                const [singleError] = errors;
                if (!singleError) {
                    throw GeneratorError.internalError("Unexpected: errors array should not be empty");
                }
                return this.buildSingleErrorMatchArm(singleError);
            } else {
                return this.buildMultiErrorMatchArm(statusCode, errors);
            }
        });

        // Add default case for unknown status codes
        arms.push(this.buildDefaultMatchArm());

        return arms;
    }

    private groupErrorsByStatusCode(): Map<number, FernIr.ErrorDeclaration[]> {
        const groups = new Map<number, Map<string, FernIr.ErrorDeclaration>>();

        Object.values(this.context.ir.errors).forEach((error) => {
            const statusCode = error.statusCode;
            const name = this.getErrorVariantName(error);

            if (!groups.has(statusCode)) {
                groups.set(statusCode, new Map());
            }

            // Keep only first error with each name (deduplication)
            const statusGroup = groups.get(statusCode);
            if (statusGroup && !statusGroup.has(name)) {
                statusGroup.set(name, error);
            }
        });

        // Convert to array format
        const result = new Map<number, FernIr.ErrorDeclaration[]>();
        groups.forEach((errorMap, statusCode) => {
            result.set(statusCode, Array.from(errorMap.values()));
        });

        return result;
    }

    private buildSingleErrorMatchArm(errorDeclaration: FernIr.ErrorDeclaration): MatchArm {
        const statusCode = errorDeclaration.statusCode;
        const errorName = this.getErrorVariantName(errorDeclaration);

        const successConstruction = this.buildSuccessConstruction(errorName, errorDeclaration);
        const fallbackConstruction = this.buildFallbackConstruction(errorName, errorDeclaration);

        const parseBodyStatements = [
            Statement.expression(Expression.raw(`// Parse error body for ${errorName}`)),
            Statement.ifLet("Some(body_str)", Expression.variable("body"), [
                Statement.ifLet(
                    "Ok(parsed)",
                    Expression.functionCall("serde_json::from_str::<serde_json::Value>", [
                        Expression.variable("body_str")
                    ]),
                    [Statement.return(successConstruction)]
                )
            ]),
            Statement.return(fallbackConstruction)
        ];

        return MatchArm.withStatements(Pattern.literal(statusCode), parseBodyStatements);
    }

    private buildSuccessConstruction(errorName: string, errorDeclaration: FernIr.ErrorDeclaration): Expression {
        const fields = this.resolveErrorFields(errorDeclaration);
        const fieldAssignments = fields.map(({ name, wireName, extractionKind }) => ({
            name,
            value: extractionKind === "u64"
                ? this.buildU64FieldExtraction(wireName)
                : this.buildStringFieldExtraction(wireName)
        }));

        return Expression.structConstruction(`Self::${errorName}`, [
            { name: "message", value: this.buildMessageParsingExpression() },
            ...fieldAssignments
        ]);
    }

    private buildMessageParsingExpression(): Expression {
        return Expression.toString(
            Expression.unwrapOr(
                Expression.andThen(
                    Expression.methodCall({
                        target: Expression.variable("parsed"),
                        method: "get",
                        args: [Expression.literal("message")]
                    }),
                    Expression.closure([{ name: "v" }], Expression.raw("v.as_str()"))
                ),
                Expression.literal("Unknown error")
            )
        );
    }

    private buildFallbackConstruction(errorName: string, errorDeclaration: FernIr.ErrorDeclaration): Expression {
        const defaultFields = this.resolveErrorFields(errorDeclaration).map(({ name }) => ({
            name,
            value: Expression.reference("None")
        }));

        return Expression.structConstruction(`Self::${errorName}`, [
            {
                name: "message",
                value: Expression.toString(
                    Expression.unwrapOr(Expression.variable("body"), Expression.literal("Unknown error"))
                )
            },
            ...defaultFields
        ]);
    }

    private buildMultiErrorMatchArm(statusCode: number, errors: FernIr.ErrorDeclaration[]): MatchArm {
        // Build a discriminator-based match for multiple errors with the same status code
        const parseBodyStatements: Statement[] = [];

        // Generate the if-let for body_str
        const innerStatements: Statement[] = [];

        // Parse the JSON
        innerStatements.push(
            Statement.ifLet(
                "Ok(parsed)",
                Expression.functionCall("serde_json::from_str::<serde_json::Value>", [Expression.variable("body_str")]),
                [
                    // Extract common fields and error_type discriminator
                    Statement.let({
                        name: "message",
                        value: Expression.unwrapOr(
                            Expression.map(
                                Expression.andThen(
                                    Expression.methodCall({
                                        target: Expression.variable("parsed"),
                                        method: "get",
                                        args: [Expression.literal("message")]
                                    }),
                                    Expression.closure([{ name: "v" }], Expression.raw("v.as_str()"))
                                ),
                                Expression.closure([{ name: "s" }], Expression.toString(Expression.variable("s")))
                            ),
                            Expression.toString(Expression.literal("Unknown error"))
                        )
                    }),
                    // Extract error discriminant field if present
                    Statement.let({
                        name: "error_type",
                        value: Expression.andThen(
                            Expression.methodCall({
                                target: Expression.variable("parsed"),
                                method: "get",
                                args: [Expression.literal(this.getErrorDiscriminantWireName())]
                            }),
                            Expression.closure([{ name: "v" }], Expression.raw("v.as_str()"))
                        )
                    }),
                    // Build the match statement for error_type
                    Statement.return(Expression.raw(this.buildErrorTypeMatchExpression(errors)))
                ]
            )
        );

        // Add fallback for when parsing fails
        const [firstError] = errors;
        if (!firstError) {
            throw GeneratorError.internalError("Unexpected: errors array should not be empty");
        }
        const fallbackConstruction = this.buildFallbackConstruction(this.getErrorVariantName(firstError), firstError);
        innerStatements.push(Statement.return(fallbackConstruction));

        parseBodyStatements.push(Statement.ifLet("Some(body_str)", Expression.variable("body"), innerStatements));

        // Add final fallback when no body
        parseBodyStatements.push(
            Statement.return(
                Expression.structConstruction(`Self::${this.getErrorVariantName(firstError)}`, [
                    { name: "message", value: Expression.toString(Expression.literal("Unknown error")) },
                    ...this.resolveErrorFields(firstError).map(({ name }) => ({
                        name,
                        value: Expression.reference("None")
                    }))
                ])
            )
        );

        return MatchArm.withStatements(Pattern.literal(statusCode), parseBodyStatements);
    }

    private buildErrorTypeMatchExpression(errors: FernIr.ErrorDeclaration[]): string {
        const [firstError] = errors;
        if (!firstError) {
            throw GeneratorError.internalError("Unexpected: errors array should not be empty");
        }
        const fields = this.buildDynamicFieldAssignments(firstError);

        // Create match arms for each error type
        const matchArms = errors.map((error) => {
            const errorName = this.getErrorVariantName(error);
            return MatchArm.withExpression(
                Pattern.some(Pattern.literal(errorName)),
                Expression.structConstruction(`Self::${errorName}`, [
                    { name: "message", value: Expression.variable("message") },
                    ...fields
                ])
            );
        });

        // Add default fallback to first error type
        const fallbackName = this.getErrorVariantName(firstError);
        matchArms.push(
            MatchArm.withExpression(
                Pattern.wildcard(),
                Expression.structConstruction(`Self::${fallbackName}`, [
                    { name: "message", value: Expression.variable("message") },
                    ...fields
                ])
            )
        );

        const matchStatement = Statement.matchEnhanced(Expression.variable("error_type"), matchArms);
        return matchStatement.toString();
    }

    private buildDynamicFieldAssignments(errorDeclaration: FernIr.ErrorDeclaration): Expression.FieldAssignment[] {
        return this.resolveErrorFields(errorDeclaration).map(({ name, wireName, extractionKind }) => ({
            name,
            value: extractionKind === "u64"
                ? this.buildU64FieldExtraction(wireName)
                : this.buildStringFieldExtraction(wireName)
        }));
    }

    private buildStringFieldExtraction(fieldName: string): Expression {
        return Expression.andThen(
            Expression.methodCall({
                target: Expression.variable("parsed"),
                method: "get",
                args: [Expression.literal(fieldName)]
            }),
            Expression.closure(
                [{ name: "v" }],
                Expression.map(
                    Expression.raw("v.as_str()"),
                    Expression.closure([{ name: "s" }], Expression.toString(Expression.variable("s")))
                )
            )
        );
    }

    private buildU64FieldExtraction(fieldName: string): Expression {
        return Expression.andThen(
            Expression.methodCall({
                target: Expression.variable("parsed"),
                method: "get",
                args: [Expression.literal(fieldName)]
            }),
            Expression.closure([{ name: "v" }], Expression.raw("v.as_u64()"))
        );
    }

    private buildDefaultMatchArm(): MatchArm {
        const httpConstruction = Expression.structConstruction("Self::Http", [
            { name: "status", value: Expression.variable("status_code") },
            {
                name: "message",
                value: Expression.toString(
                    Expression.unwrapOr(Expression.variable("body"), Expression.literal("Unknown error"))
                )
            }
        ]);

        return MatchArm.withExpression(Pattern.wildcard(), httpConstruction);
    }

    // Helper methods for creating attributes
    private createDeriveAttribute(derives: string[]): Attribute {
        return new Attribute({
            name: "derive",
            args: derives
        });
    }

    private createErrorAttribute(message: string): Attribute {
        return new Attribute({
            name: "error",
            args: [`"${message}"`]
        });
    }

    private getErrorDiscriminantWireName(): string {
        const strategy = this.context.ir.errorDiscriminationStrategy;
        if (strategy.type === "property") {
            return getWireValue(strategy.discriminant);
        }
        return "error_type";
    }

    // Helper methods
    private getErrorVariantName(errorDeclaration: FernIr.ErrorDeclaration): string {
        const safeName = this.context.case.pascalSafe(errorDeclaration.name.name);
        if (!safeName) {
            throw GeneratorError.internalError(`Error declaration missing safe name: ${JSON.stringify(errorDeclaration.name)}`);
        }
        return safeName;
    }

    private getErrorMessage(errorDeclaration: FernIr.ErrorDeclaration): string {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const statusCode = errorDeclaration.statusCode;

        const messageTemplates: Record<number, string> = {
            400: "Bad request - {message}",
            401: "Authentication failed - {message}",
            403: "Access forbidden - {message}",
            404: "Resource not found - {message}",
            409: "Conflict - {message}",
            422: "Unprocessable entity - {message}",
            429: "Rate limit exceeded - {message}",
            500: "Internal server error - {message}"
        };

        const template = messageTemplates[statusCode] || "{message}";
        return `${errorName}: ${template}`;
    }
}
