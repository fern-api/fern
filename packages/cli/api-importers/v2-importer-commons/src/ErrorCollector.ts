import * as fs from "fs";
import path from "path";
import YAML from "yaml";

import { formatLog } from "@fern-api/cli-logger";
import { LogLevel } from "@fern-api/logger";

interface APIErrorLoggingArgs {
    /* Defaults to false */
    logWarnings?: boolean;
}

export interface APIError {
    /** Defaults to warning */
    level?: APIErrorLevel;
    /** The error message */
    message: string;
    /** JSON path to where the error occurred */
    path?: string[];

    resolution?: string;
}

export enum APIErrorLevel {
    WARNING = "warning",
    ERROR = "error"
}

/**
 * Statistics about collected errors and warnings
 */
export interface ErrorStatistics {
    /** Number of errors collected */
    numErrors: number;
    /** Number of warnings collected */
    numWarnings: number;
}

export class ErrorCollector {
    private errors: APIError[] = [];
    private readonly logger: { log: (level: LogLevel, ...args: string[]) => void };
    private readonly yamlDocument: YAML.Document;

    public readonly relativeFilepathToSpec?: string;

    constructor({
        logger,
        relativeFilepathToSpec
    }: {
        logger: { log: (level: LogLevel, ...args: string[]) => void };
        relativeFilepathToSpec?: string;
    }) {
        this.logger = logger;
        this.relativeFilepathToSpec = relativeFilepathToSpec;
        // Initialize yamlDocument as undefined
        this.yamlDocument = new YAML.Document();

        // If a relative filepath is provided, try to read and parse it
        if (relativeFilepathToSpec) {
            try {
                const contents = fs.readFileSync(path.resolve(relativeFilepathToSpec), "utf8");
                this.yamlDocument = YAML.parseDocument(contents);
            } catch (error) {
                logger.log(
                    LogLevel.Warn,
                    `Failed to read or parse YAML from ${relativeFilepathToSpec}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    }

    public collect(error: APIError): void {
        this.errors.push(error);
    }

    public getErrors(): APIError[] {
        return this.errors;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    /**
     * Returns statistics about collected errors and warnings
     * @returns Object containing counts of errors and warnings
     */
    public getErrorStats(): ErrorStatistics {
        let numErrors = 0;
        let numWarnings = 0;

        for (const error of this.errors) {
            if (error.level === APIErrorLevel.ERROR) {
                numErrors++;
            } else {
                // Count as warning if level is explicitly WARNING or if level is undefined (defaults to warning)
                numWarnings++;
            }
        }

        return { numErrors, numWarnings };
    }

    public logErrors({ logWarnings }: APIErrorLoggingArgs): void {
        for (const error of this.errors.slice(0, 2)) {
            if (error.level === APIErrorLevel.WARNING && !logWarnings) {
                continue;
            }
            switch (error.level) {
                case APIErrorLevel.ERROR:
                    this.logger.log(LogLevel.Error, error.message);
                    if (error.path && error.path.length > 0) {
                        const locationInfo = error.path.join(" -> ");
                        this.logger.log(LogLevel.Error, `\t- at location (${locationInfo})`);
                    }
                    break;
                case APIErrorLevel.WARNING:
                default:
                    this.logger.log(LogLevel.Warn, error.message);
                    if (error.path && error.path.length > 0) {
                        const locationInfo = this.relativeFilepathToSpec
                            ? `${this.relativeFilepathToSpec}:${error.path.join("/")}`
                            : `${error.path.join("/")}`;
                        this.logger.log(LogLevel.Warn, `\t- at location (${locationInfo})`);
                    }
            }
            this.logger.log(LogLevel.Info, "");
        }
    }
}
