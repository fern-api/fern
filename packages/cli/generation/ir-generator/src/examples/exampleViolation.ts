export type ExampleViolationSeverity = "error" | "warning";

export interface ExampleViolation {
    message: string;
    severity?: ExampleViolationSeverity;
}
