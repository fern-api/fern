import chalk from "chalk";

import { formatLog } from "@fern-api/cli-logger";
import { LogLevel } from "@fern-api/logger";

/**
 * Represents an error encountered while parsing OpenAPI specs
 */
export interface OpenApiError {
    /** The error message */
    message: string;
    /** JSON path to where the error occurred */
    path?: string[];
}

/**
 * Collects and stores errors encountered during OpenAPI parsing
 */

export class ErrorCollector {
    private errors: OpenApiError[] = [];
    private readonly logger: { log: (level: LogLevel, ...args: string[]) => void };

    constructor({ logger }: { logger: { log: (level: LogLevel, ...args: string[]) => void } }) {
        this.logger = logger;
    }

    public collect(error: OpenApiError): void {
        this.errors.push(error);
    }

    public getErrors(): OpenApiError[] {
        return this.errors;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public logErrors(): void {
        for (const error of this.errors) {
            this.logger.log(
                LogLevel.Info,
                formatLog({
                    title: error.message,
                    breadcrumbs: error.path,
                    subtitle: error.path != null ? chalk.dim(error.path.join(" -> ")) : undefined
                })
            );
        }
    }
}
