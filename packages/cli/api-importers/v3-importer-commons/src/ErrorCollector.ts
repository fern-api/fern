import { RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import SourceMap from "js-yaml-source-map";

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
    private readonly breadcrumbToLineNumberMapper: BreadcrumbToLineNumber | undefined;

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
        // If a relative filepath is provided, try to read and parse it
        if (relativeFilepathToSpec) {
            this.breadcrumbToLineNumberMapper = new BreadcrumbToLineNumber({
                logger,
                relativePathToFile: RelativeFilePath.of(relativeFilepathToSpec)
            });
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
     * Removes duplicate errors from the collection
     * Two errors are considered duplicates if they have the same message, level, and path
     * @returns The number of duplicate errors removed
     */
    public dedupe(): number {
        const uniqueErrors: APIError[] = [];
        const seen = new Set<string>();
        let duplicatesRemoved = 0;

        for (const error of this.errors) {
            // Create a unique key for each error based on message, level, and path
            const pathString = error.path ? error.path.join("->") : "";
            const errorKey = `${error.message}|${error.level || APIErrorLevel.WARNING}|${pathString}`;

            if (!seen.has(errorKey)) {
                seen.add(errorKey);
                uniqueErrors.push(error);
            } else {
                duplicatesRemoved++;
            }
        }

        this.errors = uniqueErrors;
        return duplicatesRemoved;
    }

    /**
     * Returns statistics about collected errors and warnings
     * @returns Object containing counts of errors and warnings
     */
    public getErrorStats(): ErrorStatistics {
        this.dedupe();

        let numErrors = 0;
        let numWarnings = 0;

        for (const error of this.errors) {
            if (error.level === APIErrorLevel.ERROR) {
                numErrors++;
            } else if (error.level === APIErrorLevel.WARNING || error.level === undefined) {
                // Count as warning if level is explicitly WARNING or if level is undefined (defaults to warning)
                numWarnings++;
            }
        }

        return { numErrors, numWarnings };
    }

    public async logErrors({ logWarnings }: APIErrorLoggingArgs): Promise<void> {
        this.dedupe();

        for (const error of this.errors) {
            // Treat undefined level as WARNING (as per interface documentation)
            const level = error.level ?? APIErrorLevel.WARNING;

            if (level === APIErrorLevel.WARNING && !logWarnings) {
                continue;
            }

            switch (level) {
                case APIErrorLevel.ERROR:
                    this.logger.log(LogLevel.Debug, error.message);
                    if (error.path && error.path.length > 0) {
                        const sourceLocation = await this.breadcrumbToLineNumberMapper?.getSourceLocation(error.path);
                        const locationInfo = sourceLocation
                            ? `${this.relativeFilepathToSpec}:${sourceLocation.line}:${sourceLocation.column}`
                            : error.path.join(" -> ");
                        this.logger.log(LogLevel.Debug, `\t- at location (${locationInfo})`);
                    }
                    break;
                case APIErrorLevel.WARNING:
                    this.logger.log(LogLevel.Warn, error.message);
                    if (error.path && error.path.length > 0) {
                        const sourceLocation = await this.breadcrumbToLineNumberMapper?.getSourceLocation(error.path);
                        const locationInfo = sourceLocation
                            ? `${this.relativeFilepathToSpec}:${sourceLocation.line}:${sourceLocation.column}`
                            : error.path.join(" -> ");
                        this.logger.log(LogLevel.Warn, `\t- at location (${locationInfo})`);
                    }
                    if (error.resolution) {
                        this.logger.log(LogLevel.Warn, `\t- resolution: ${error.resolution}`);
                    }
                    break;
            }
        }
    }
}

export declare namespace BreadcrumbToLineNumber {
    interface Args {
        relativePathToFile: RelativeFilePath;
        logger: { log: (level: LogLevel, ...args: string[]) => void };
    }

    interface SourceLocation {
        line: number;
        column: number;
        position: number;
    }
}

class BreadcrumbToLineNumber {
    private readonly logger: { log: (level: LogLevel, ...args: string[]) => void };
    private readonly relativePathToFile: RelativeFilePath;
    private readonly map = new SourceMap();
    private initialized = false;

    constructor({ relativePathToFile, logger }: BreadcrumbToLineNumber.Args) {
        this.relativePathToFile = relativePathToFile;
        this.logger = logger;
    }

    /**
     * Reads the file content and initializes the line number mapping
     * @returns Promise that resolves when initialization is complete
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            const fileContent = await readFile(this.relativePathToFile, "utf-8");
            yaml.load(fileContent, { listener: this.map.listen() });
            this.initialized = true;
        } catch (error) {
            this.logger.log(
                LogLevel.Warn,
                `Failed to initialize line number mapping for ${this.relativePathToFile}: ${JSON.stringify(error)}`
            );
        }
    }

    /**
     * Gets the line number for a specific breadcrumb path
     * @param breadcrumbs The path to the element in the document
     * @returns The line number if found, undefined otherwise
     */
    public async getSourceLocation(breadcrumbs: string[]): Promise<BreadcrumbToLineNumber.SourceLocation | undefined> {
        if (!this.initialized) {
            await this.initialize();
        }

        const location = this.map.lookup(breadcrumbs);

        return location;
    }
}
