import { ErrorDeclaration, TypeReference, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ErrorGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public generateErrorRs(): string {
        return `use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
${this.generateApiSpecificErrorVariants()}
    
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Serialization error: {0}")]  
    Serialization(#[from] serde_json::Error),
}

impl ApiError {
    /// Create ApiError from HTTP response
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
        match status_code {
${this.generateStatusCodeMapping()}
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
`;
    }

    private generateApiSpecificErrorVariants(): string {
        const variants: string[] = [];

        // Generate error variants directly from IR error definitions
        for (const [errorId, errorDeclaration] of Object.entries(this.context.ir.errors)) {
            const variant = this.generateErrorVariantFromDeclaration(errorDeclaration);
            variants.push(variant);
        }

        return variants.join("\n");
    }

    private generateErrorVariantFromDeclaration(errorDeclaration: ErrorDeclaration): string {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const fields = this.getContextRichFields(errorDeclaration);
        const errorMessage = this.getContextRichErrorMessage(errorDeclaration, fields);

        return `    #[error("${errorMessage}")]
    ${errorName} { ${fields.join(", ")} },`;
    }

    private getErrorVariantName(errorDeclaration: ErrorDeclaration): string {
        // Use the actual error name from the API definition
        const safeName = errorDeclaration.name.name.pascalCase.safeName;
        if (!safeName) {
            throw new Error(`Error declaration missing safe name: ${JSON.stringify(errorDeclaration.name)}`);
        }
        return safeName;
    }

    private getContextRichFields(errorDeclaration: ErrorDeclaration): string[] {
        const fields: string[] = [];

        // Extract fields from the error type if it exists
        if (errorDeclaration.type != null) {
            const typeFields = this.extractFieldsFromType(errorDeclaration.type);
            fields.push(...typeFields);
        }

        // Add semantic fields based on status code patterns
        const semanticFields = this.getSemanticFieldsForStatusCode(errorDeclaration.statusCode);
        fields.push(...semanticFields);

        // Ensure we always have at least a message field
        if (fields.length === 0) {
            fields.push("message: String");
        }

        // Remove duplicates while preserving order
        return Array.from(new Set(fields));
    }

    private extractFieldsFromType(typeRef: TypeReference): string[] {
        // This is a simplified type extraction - in a full implementation,
        // we would need to resolve the TypeReference through the type system

        // For now, extract common patterns based on type structure
        // This would be enhanced when full Rust type mapping is implemented
        return ["message: String"];
    }

    private getSemanticFieldsForStatusCode(statusCode: number): string[] {
        // Add context-rich fields based on HTTP status code semantics
        switch (statusCode) {
            case 400: // Bad Request
                return ["field: Option<String>", "details: Option<String>"];
            case 401: // Unauthorized
                return ["auth_type: Option<String>"];
            case 403: // Forbidden
                return ["resource: Option<String>", "required_permission: Option<String>"];
            case 404: // Not Found
                return ["resource_id: Option<String>", "resource_type: Option<String>"];
            case 409: // Conflict
                return ["conflict_type: Option<String>"];
            case 422: // Unprocessable Entity
                return ["field: Option<String>", "validation_error: Option<String>"];
            case 429: // Rate Limited
                return ["retry_after_seconds: Option<u64>", "limit_type: Option<String>"];
            case 500: // Internal Server Error
                return ["error_id: Option<String>"];
            default:
                return [];
        }
    }

    private getContextRichErrorMessage(errorDeclaration: ErrorDeclaration, fields: string[]): string {
        const errorName = this.getErrorVariantName(errorDeclaration);
        const statusCode = errorDeclaration.statusCode;

        // Generate context-rich error messages based on status code and available fields
        const hasField = fields.some((f) => f.includes("field:"));
        const hasResourceId = fields.some((f) => f.includes("resource_id:"));
        const hasRetryAfter = fields.some((f) => f.includes("retry_after_seconds:"));

        switch (statusCode) {
            case 400:
                return hasField
                    ? `${errorName}: Validation error in field '{{field:?}}': {{message}}`
                    : `${errorName}: Bad request - {{message}}`;
            case 401:
                return `${errorName}: Authentication failed - {{message}}`;
            case 403:
                return `${errorName}: Access forbidden - {{message}}`;
            case 404:
                return hasResourceId
                    ? `${errorName}: {{resource_type:?}} not found: {{resource_id:?}}`
                    : `${errorName}: Resource not found - {{message}}`;
            case 409:
                return `${errorName}: Conflict - {{message}}`;
            case 422:
                return hasField
                    ? `${errorName}: Validation error in field '{{field:?}}': {{validation_error:?}}`
                    : `${errorName}: Unprocessable entity - {{message}}`;
            case 429:
                return hasRetryAfter
                    ? `${errorName}: Rate limit exceeded. Retry after {{retry_after_seconds:?}} seconds`
                    : `${errorName}: Rate limit exceeded - {{message}}`;
            case 500:
                return `${errorName}: Internal server error - {{message}}`;
            default:
                return `${errorName}: {{message}}`;
        }
    }

    private generateStatusCodeMapping(): string {
        const mappings: string[] = [];

        for (const [errorId, errorDeclaration] of Object.entries(this.context.ir.errors)) {
            const errorName = this.getErrorVariantName(errorDeclaration);
            const statusCode = errorDeclaration.statusCode;

            mappings.push(`            ${statusCode} => {
                // Parse error body for ${errorName}
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::${errorName} {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
${this.generateFieldParsing(errorDeclaration)}
                        };
                    }
                }
                Self::${errorName} {
                    message: body.unwrap_or("Unknown error").to_string(),
${this.generateDefaultFields(errorDeclaration)}
                }
            },`);
        }

        return mappings.join("\n");
    }

    private generateFieldParsing(errorDeclaration: ErrorDeclaration): string {
        const semanticFields = this.getSemanticFieldsForStatusCode(errorDeclaration.statusCode);
        const fieldParsing: string[] = [];

        for (const field of semanticFields) {
            const fieldParts = field.split(":");
            if (fieldParts.length === 0) {
                continue;
            }
            const trimmedFieldName = fieldParts[0]?.trim();

            if (trimmedFieldName === "retry_after_seconds") {
                fieldParsing.push(`                            ${trimmedFieldName}: parsed.get("${trimmedFieldName}")
                                .and_then(|v| v.as_u64()),`);
            } else {
                fieldParsing.push(`                            ${trimmedFieldName}: parsed.get("${trimmedFieldName}")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),`);
            }
        }

        return fieldParsing.join("\n");
    }

    private generateDefaultFields(errorDeclaration: ErrorDeclaration): string {
        const semanticFields = this.getSemanticFieldsForStatusCode(errorDeclaration.statusCode);
        const defaultFields: string[] = [];

        for (const field of semanticFields) {
            const fieldParts = field.split(":");
            if (fieldParts.length === 0) {
                continue;
            }
            const trimmedFieldName = fieldParts[0]?.trim();
            defaultFields.push(`                    ${trimmedFieldName}: None,`);
        }

        return defaultFields.join("\n");
    }
}
