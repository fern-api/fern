export declare namespace ErrorReporter {
    type Path = readonly PathItem[];

    type PathItem = string | DetailedPathItem;

    interface DetailedPathItem {
        key: string;
        arrayIndex?: number;
    }

    type Severity = "critical" | "warning";

    interface Error {
        path?: Path;
        severity: Severity;
        message: string;
    }
}

export class ErrorReporter {
    private errors: ErrorReporter.Error[];

    constructor() {
        this.errors = [];
    }

    public addError(err: ErrorReporter.Error): void {
        this.errors.push(err);
    }

    public getBySeverity(severity: ErrorReporter.Severity): ErrorReporter.Error[] {
        return this.errors.filter((err) => err.severity === severity);
    }

    public reportAsString(err: ErrorReporter.Error): string {
        if (err.path == null) {
            return err.message;
        }
        return `${err.path.join(".")}: ${err.message}`;
    }
}
