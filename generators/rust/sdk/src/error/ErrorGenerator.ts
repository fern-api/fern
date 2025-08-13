import {
    Attribute,
    CodeBlock,
    Enum,
    EnumVariant,
    Expression,
    Field,
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
        const errorEnum = this.buildErrorEnum();
        const errorImpl = this.buildErrorImpl();

        const errorModule = new Module({
            useStatements: [
                new UseStatement({
                    path: "thiserror",
                    items: ["Error"]
                })
            ],
            enums: [errorEnum],
            implBlocks: [errorImpl]
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
        const variants: EnumVariant[] = [];

        // Add API-specific error variants
        Object.values(this.context.ir.errors).forEach((errorDeclaration) => {
            variants.push(this.buildApiErrorVariant(errorDeclaration));
        });

        // Add standard variants
        variants.push(this.buildHttpErrorVariant());
        variants.push(this.buildNetworkErrorVariant());
        variants.push(this.buildSerializationErrorVariant());

        return variants;
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

    private buildHttpErrorVariant(): EnumVariant {
        return new EnumVariant({
            name: "Http",
            attributes: [this.createErrorAttribute("HTTP error {status}: {message}")],
            namedFields: [
                { name: "status", type: Type.primitive(PrimitiveType.U16) },
                { name: "message", type: Type.string() }
            ]
        });
    }

    private buildNetworkErrorVariant(): EnumVariant {
        return new EnumVariant({
            name: "Network",
            attributes: [this.createErrorAttribute("Network error: {0}")],
            data: [Type.reference(new Reference({ name: "reqwest::Error" }))]
        });
    }

    private buildSerializationErrorVariant(): EnumVariant {
        return new EnumVariant({
            name: "Serialization",
            attributes: [this.createErrorAttribute("Serialization error: {0}")],
            data: [Type.reference(new Reference({ name: "serde_json::Error" }))]
        });
    }

    private buildErrorFields(errorDeclaration: ErrorDeclaration): Array<{ name: string; type: Type }> {
        const fields: Array<{ name: string; type: Type }> = [{ name: "message", type: Type.string() }];

        const semanticFields = this.getSemanticFields(errorDeclaration.statusCode);
        semanticFields.forEach((fieldDef) => {
            const [name, typeStr] = fieldDef.split(": ");
            fields.push({
                name: name?.trim() || "",
                type: this.parseRustType(typeStr?.trim() || "String")
            });
        });

        return fields;
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
        const arms: MatchArm[] = [];

        // Add arms for each API error
        Object.values(this.context.ir.errors).forEach((errorDeclaration) => {
            arms.push(this.buildErrorMatchArm(errorDeclaration));
        });

        // Add default case
        arms.push(this.buildDefaultMatchArm());

        return arms;
    }

    private buildErrorMatchArm(errorDeclaration: ErrorDeclaration): MatchArm {
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
        const fieldAssignments = this.buildFieldAssignments(errorDeclaration);

        return Expression.structConstruction(`Self::${errorName}`, [
            {
                name: "message",
                value: this.buildMessageParsingExpression()
            },
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

    private buildFieldAssignments(errorDeclaration: ErrorDeclaration): Expression.FieldAssignment[] {
        const semanticFields = this.getSemanticFields(errorDeclaration.statusCode);
        return semanticFields.map((field) => {
            const fieldName = this.extractFieldName(field);
            return {
                name: fieldName,
                value: this.buildFieldParsingExpression(fieldName)
            };
        });
    }

    private buildFieldParsingExpression(fieldName: string): Expression {
        if (fieldName === "retry_after_seconds") {
            return Expression.andThen(
                Expression.methodCall({
                    target: Expression.variable("parsed"),
                    method: "get",
                    args: [Expression.literal(fieldName)]
                }),
                Expression.closure([{ name: "v" }], Expression.raw("v.as_u64()"))
            );
        }

        return Expression.map(
            Expression.andThen(
                Expression.methodCall({
                    target: Expression.variable("parsed"),
                    method: "get",
                    args: [Expression.literal(fieldName)]
                }),
                Expression.closure([{ name: "v" }], Expression.raw("v.as_str()"))
            ),
            Expression.closure([{ name: "s" }], Expression.toString(Expression.variable("s")))
        );
    }

    private buildFallbackConstruction(errorName: string, errorDeclaration: ErrorDeclaration): Expression {
        const semanticFields = this.getSemanticFields(errorDeclaration.statusCode);
        const defaultFieldAssignments = semanticFields.map((field) => ({
            name: this.extractFieldName(field),
            value: Expression.reference("None")
        }));

        return Expression.structConstruction(`Self::${errorName}`, [
            {
                name: "message",
                value: Expression.toString(
                    Expression.unwrapOr(Expression.variable("body"), Expression.literal("Unknown error"))
                )
            },
            ...defaultFieldAssignments
        ]);
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

    private parseRustType(typeStr: string): Type {
        if (typeStr === "String") {
            return Type.string();
        }
        if (typeStr === "Option<String>") {
            return Type.option(Type.string());
        }
        if (typeStr === "Option<u64>") {
            return Type.option(Type.primitive(PrimitiveType.U64));
        }
        return Type.reference(new Reference({ name: typeStr }));
    }

    // Helper methods (same logic as before)
    private getErrorVariantName(errorDeclaration: ErrorDeclaration): string {
        const safeName = errorDeclaration.name.name.pascalCase.safeName;
        if (!safeName) {
            throw new Error(`Error declaration missing safe name: ${JSON.stringify(errorDeclaration.name)}`);
        }
        return safeName;
    }

    private getSemanticFields(statusCode: number): string[] {
        const statusCodeFieldMap: Record<number, string[]> = {
            400: ["field: Option<String>", "details: Option<String>"],
            401: ["auth_type: Option<String>"],
            403: ["resource: Option<String>", "required_permission: Option<String>"],
            404: ["resource_id: Option<String>", "resource_type: Option<String>"],
            409: ["conflict_type: Option<String>"],
            422: ["field: Option<String>", "validation_error: Option<String>"],
            429: ["retry_after_seconds: Option<u64>", "limit_type: Option<String>"],
            500: ["error_id: Option<String>"]
        };
        return statusCodeFieldMap[statusCode] || [];
    }

    private getErrorMessage(errorDeclaration: ErrorDeclaration): string {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const statusCode = errorDeclaration.statusCode;

        const messageTemplates: Record<number, string> = {
            400: `${errorName}: Bad request - {{message}}`,
            401: `${errorName}: Authentication failed - {{message}}`,
            403: `${errorName}: Access forbidden - {{message}}`,
            404: `${errorName}: Resource not found - {{message}}`,
            409: `${errorName}: Conflict - {{message}}`,
            422: `${errorName}: Unprocessable entity - {{message}}`,
            429: `${errorName}: Rate limit exceeded - {{message}}`,
            500: `${errorName}: Internal server error - {{message}}`
        };

        return messageTemplates[statusCode] || `${errorName}: {{message}}`;
    }

    private extractFieldName(field: string): string {
        return field.split(":")[0]?.trim() || "";
    }
}
