import { CliError } from "@fern-api/task-context";

/**
 * Shape of a Zod-like schema with a `safeParse` method. Avoids importing zod
 * directly so this helper stays compatible with any schema version.
 */
interface SafeParseable {
    safeParse(
        value: unknown
    ): { success: true; data: unknown } | { success: false; error: { issues: readonly unknown[] } };
}

type InferParsed<S> = S extends {
    safeParse(
        value: unknown
    ): { success: true; data: infer T } | { success: false; error: { issues: readonly unknown[] } };
}
    ? T
    : never;

/**
 * Validate parsed JSON against a Zod schema. On failure, throws a `CliError`
 * whose message lists each zod issue (one per line) so agents receive
 * actionable feedback instead of a stack trace.
 */
export function validateJsonInput<S extends SafeParseable>({
    value,
    schema,
    schemaName
}: {
    value: unknown;
    schema: S;
    schemaName: string;
}): InferParsed<S> {
    const result = schema.safeParse(value);
    if (result.success) {
        return result.data as InferParsed<S>;
    }

    const issues = result.error.issues
        .map((issue) => formatZodIssue(issue))
        .filter((line): line is string => line.length > 0);

    const issueLines = issues.length > 0 ? issues.map((line) => `  - ${line}`).join("\n") : "  - (no details)";

    throw new CliError({
        message: `--params did not match the ${schemaName} schema:\n${issueLines}\n\nRun 'fern schema ${schemaName}' to see the full schema.`,
        code: CliError.Code.ValidationError
    });
}

function formatZodIssue(issue: unknown): string {
    if (typeof issue !== "object" || issue == null) {
        return "";
    }
    const obj = issue as { path?: unknown; message?: unknown };
    const path = Array.isArray(obj.path) ? obj.path.join(".") : "";
    const message = typeof obj.message === "string" ? obj.message : "";
    if (path.length === 0) {
        return message;
    }
    return `${path}: ${message}`;
}
