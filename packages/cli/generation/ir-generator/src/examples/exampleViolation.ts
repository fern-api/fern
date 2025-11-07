export type ExampleViolationSeverity = "error" | "warning" | "fatal";

export interface ExampleViolation {
    message: string;
    severity?: ExampleViolationSeverity;
}
