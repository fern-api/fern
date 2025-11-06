export interface ExampleViolation {
    message: string;
    severity?: "warning" | "fatal";
    code?: string;
}
