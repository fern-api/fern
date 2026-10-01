export function normalizeSensitiveValues(values: string[]): string[] {
    return [...new Set(values.filter((value) => value.length > 0))].sort((left, right) => right.length - left.length);
}

export function redactSensitiveValues(message: string, sensitiveValues: string[]): string {
    return normalizeSensitiveValues(sensitiveValues).reduce(
        (redacted, value) => redacted.replaceAll(value, "[REDACTED]"),
        message
    );
}

export function redactPublicationIdentifier(identifier: string, sensitiveValues: string[]): string {
    return redactSensitiveValues(identifier, sensitiveValues);
}
