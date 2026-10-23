export type ViolationSeverity = "fatal" | "error" | "warning";

/** The severity of a validation violation that does not declare one. */
export const DEFAULT_VIOLATION_SEVERITY: ViolationSeverity = "fatal";

/** Returns the given severity, or {@link DEFAULT_VIOLATION_SEVERITY} when the violation does not declare one. */
export function resolveViolationSeverity(severity: ViolationSeverity | undefined): ViolationSeverity {
    return severity ?? DEFAULT_VIOLATION_SEVERITY;
}
