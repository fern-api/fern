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
        for (const error of this.errors) {
            if (error.level === APIErrorLevel.WARNING && !logWarnings) {
                continue;
            }           
            switch (error.level) {
                case APIErrorLevel.ERROR: 
                    this.logger.log(
                        LogLevel.Error,
                        formatLog({
                            title: error.message,
                            breadcrumbs: error.path
                        })
                    );
                    break;
                case APIErrorLevel.WARNING: 
                default: 
                    this.logger.log(
                        LogLevel.Warn,
                        formatLog({
                            title: error.message,
                            breadcrumbs: error.path
                        })
                    );                
            }
        }
    }
}
