import type { Logger } from "@fern-api/logger";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OpenApiValidationOptions } from "./types";

export interface Rule {
    name: string;
    description?: string;
    DISABLE_RULE?: boolean;
    validate: (context: RuleContext) => RuleViolation[];
}

export interface RuleContext {
    document: OpenAPIV3_1.Document;
    logger: Logger;
    options: OpenApiValidationOptions;
}

export interface RuleViolation {
    severity: "fatal" | "error" | "warning";
    message: string;
    path?: string;
}
