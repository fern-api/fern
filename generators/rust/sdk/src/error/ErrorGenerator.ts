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
import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

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

        return errorModule.toString();
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
        return [
            this.buildStandardVariant("Http", "HTTP error {status}: {message}", [
                { name: "status", type: Type.primitive(PrimitiveType.U16) },
                { name: "message", type: Type.string() }
            ]),
            this.buildStandardVariant("Network", "Network error: {0}", undefined, [
                Type.reference(new Reference({ name: "reqwest::Error" }))
            ]),
            this.buildStandardVariant("Serialization", "Serialization error: {0}", undefined, [
                Type.reference(new Reference({ name: "serde_json::Error" }))
            ]),
            this.buildStandardVariant("Configuration", "Configuration error: {0}", undefined, [Type.string()]),
            this.buildStandardVariant("InvalidHeader", "Invalid header value"),
            this.buildStandardVariant("RequestClone", "Could not clone request for retry"),
            this.buildStandardVariant("StreamTerminated", "SSE stream terminated"),
            this.buildStandardVariant("SseParseError", "SSE parse error: {0}", undefined, [Type.string()])
        ];
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

    private buildApiErrorVariant(errorDeclaration: ErrorDeclaration): EnumVariant {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const errorMessage = this.getErrorMessage(errorDeclaration);
        const fields = this.buildErrorFields(errorDeclaration);

        return new EnumVariant({
            name: errorName,
            attributes: [this.createErrorAttribute(errorMessage)],
            namedFields: fields
        });
    }

    private buildErrorFields(errorDeclaration: ErrorDeclaration): Array<{ name: string; type: Type }> {
        const fields = [{ name: "message", type: Type.string() }];

        // Add semantic fields based on status code
        const statusFields = this.getStatusCodeFields(errorDeclaration.statusCode);
        fields.push(...statusFields);

        return fields;
    }

    private getStatusCodeFields(statusCode: number): Array<{ name: string; type: Type }> {
        const fieldMap: Record<number, Array<{ name: string; type: Type }>> = {
            400: [
                { name: "field", type: Type.option(Type.string()) },
                { name: "details", type: Type.option(Type.string()) }
            ],
            401: [{ name: "auth_type", type: Type.option(Type.string()) }],
            403: [
                { name: "resource", type: Type.option(Type.string()) },
                { name: "required_permission", type: Type.option(Type.string()) }
            ],
            404: [
                { name: "resource_id", type: Type.option(Type.string()) },
                { name: "resource_type", type: Type.option(Type.string()) }
            ],
            409: [{ name: "conflict_type", type: Type.option(Type.string()) }],
            422: [
                { name: "field", type: Type.option(Type.string()) },
                { name: "validation_error", type: Type.option(Type.string()) }
            ],
            429: [
                { name: "retry_after_seconds", type: Type.option(Type.primitive(PrimitiveType.U64)) },
                { name: "limit_type", type: Type.option(Type.string()) }
            ],
            500: [{ name: "error_id", type: Type.option(Type.string()) }]
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
                    throw new Error("Unexpected: errors array should not be empty");
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

    private groupErrorsByStatusCode(): Map<number, ErrorDeclaration[]> {
        const groups = new Map<number, Map<string, ErrorDeclaration>>();

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
        const result = new Map<number, ErrorDeclaration[]>();
        groups.forEach((errorMap, statusCode) => {
            result.set(statusCode, Array.from(errorMap.values()));
        });

        return result;
    }

    private buildSingleErrorMatchArm(errorDeclaration: ErrorDeclaration): MatchArm {
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

    private buildSuccessConstruction(errorName: string, errorDeclaration: ErrorDeclaration): Expression {
        const statusFields = this.getStatusCodeFields(errorDeclaration.statusCode);
        const fieldAssignments = statusFields.map(({ name }) => ({
            name,
            value:
                name === "retry_after_seconds"
                    ? this.buildU64FieldExtraction(name)
                    : this.buildStringFieldExtraction(name)
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

    private buildFallbackConstruction(errorName: string, errorDeclaration: ErrorDeclaration): Expression {
        const statusFields = this.getStatusCodeFields(errorDeclaration.statusCode);
        const defaultFields = statusFields.map(({ name }) => ({
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

    private buildMultiErrorMatchArm(statusCode: number, errors: ErrorDeclaration[]): MatchArm {
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
                    // Extract error_type field if present
                    Statement.let({
                        name: "error_type",
                        value: Expression.andThen(
                            Expression.methodCall({
                                target: Expression.variable("parsed"),
                                method: "get",
                                args: [Expression.literal("error_type")]
                            }),
                            Expression.closure([{ name: "v" }], Expression.raw("v.as_str()"))
                        )
                    }),
                    // Build the match statement for error_type
                    Statement.return(Expression.raw(this.buildErrorTypeMatchExpression(errors, statusCode)))
                ]
            )
        );

        // Add fallback for when parsing fails
        const [firstError] = errors;
        if (!firstError) {
            throw new Error("Unexpected: errors array should not be empty");
        }
        const fallbackConstruction = this.buildFallbackConstruction(this.getErrorVariantName(firstError), firstError);
        innerStatements.push(Statement.return(fallbackConstruction));

        parseBodyStatements.push(Statement.ifLet("Some(body_str)", Expression.variable("body"), innerStatements));

        // Add final fallback when no body
        parseBodyStatements.push(
            Statement.return(
                Expression.structConstruction(`Self::${this.getErrorVariantName(firstError)}`, [
                    { name: "message", value: Expression.toString(Expression.literal("Unknown error")) },
                    ...this.getStatusCodeFields(statusCode).map(({ name }) => ({
                        name,
                        value: Expression.reference("None")
                    }))
                ])
            )
        );

        return MatchArm.withStatements(Pattern.literal(statusCode), parseBodyStatements);
    }

    private buildErrorTypeMatchExpression(errors: ErrorDeclaration[], statusCode: number): string {
        const fields = this.buildDynamicFieldAssignments(statusCode);

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
        const [firstError] = errors;
        if (!firstError) {
            throw new Error("Unexpected: errors array should not be empty");
        }
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

    private buildDynamicFieldAssignments(statusCode: number): Expression.FieldAssignment[] {
        const fields = this.getStatusCodeFields(statusCode);

        return fields.map(({ name }) => {
            const fieldValue =
                name === "retry_after_seconds"
                    ? this.buildU64FieldExtraction(name)
                    : this.buildStringFieldExtraction(name);

            return { name, value: fieldValue };
        });
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

    // Helper methods
    private getErrorVariantName(errorDeclaration: ErrorDeclaration): string {
        const safeName = errorDeclaration.name.name.pascalCase.safeName;
        if (!safeName) {
            throw new Error(`Error declaration missing safe name: ${JSON.stringify(errorDeclaration.name)}`);
        }
        return safeName;
    }

    private getErrorMessage(errorDeclaration: ErrorDeclaration): string {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const statusCode = errorDeclaration.statusCode;

        const messageTemplates: Record<number, string> = {
            400: "Bad request - {{message}}",
            401: "Authentication failed - {{message}}",
            403: "Access forbidden - {{message}}",
            404: "Resource not found - {{message}}",
            409: "Conflict - {{message}}",
            422: "Unprocessable entity - {{message}}",
            429: "Rate limit exceeded - {{message}}",
            500: "Internal server error - {{message}}"
        };

        const template = messageTemplates[statusCode] || "{{message}}";
        return `${errorName}: ${template}`;
    }
}
