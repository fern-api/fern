export const Severity = {
    Critical: "CRITICAL",
    Warning: "WARNING"
} as const;

export declare namespace ErrorReporter {
    type Path = readonly PathItem[];

    type PathItem = string | ArrayPathItem;

    type Severity = (typeof Severity)[keyof typeof Severity];

    interface ArrayPathItem {
        index: number;
    }

    interface Error {
        path?: Path;
        severity: Severity;
        message: string;
    }
}

interface Error_ {
    severity: "CRITICAL" | "WARNING";
    path: string[] | undefined;
    message: string;
}

export class ErrorReporter {
    private errors: ErrorReporter.Error[];
    private path: ErrorReporter.PathItem[];

    constructor() {
        this.errors = [];
        this.path = [];
    }

    public add(err: Omit<ErrorReporter.Error, "path">): void {
        this.errors.push({
            ...err,
            path: [...this.path]
        });
    }

    public scope(path: ErrorReporter.PathItem): void {
        this.path.push(path);
    }

    public unscope(): void {
        this.path.pop();
    }

    public getBySeverity(severity: ErrorReporter.Severity): ErrorReporter.Error[] {
        return this.errors.filter((err) => err.severity === severity);
    }

    public empty(): boolean {
        return this.errors.length === 0;
    }

    public size(): number {
        return this.errors.length;
    }

    public clone(): ErrorReporter {
        const clone = new ErrorReporter();
        clone.errors = [...this.errors];
        clone.path = [...this.path];
        return clone;
    }

    public reset(): void {
        this.errors = [];
        this.path = [];
    }

    public toDynamicSnippetErrors(): Error_[] {
        return this.errors.map((err) => ({
            severity: err.severity,
            path: err.path != null ? this.pathToStringArray(err.path) : undefined,
            message: err.message
        }));
    }

    private pathToStringArray(path: ErrorReporter.Path): string[] {
        const result: string[] = [];
        for (const item of path) {
            if (typeof item === "string") {
                result.push(item);
                continue;
            }
            result[result.length - 1] += `[${item.index}]`;
        }
        return result;
    }
}
