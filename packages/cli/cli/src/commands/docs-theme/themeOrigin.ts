export const FDR_ORIGIN = process.env.OVERRIDE_FDR_ORIGIN ?? "https://registry.buildwithfern.com";

export function describeFetchError(error: unknown): string {
    if (!(error instanceof Error)) {
        return String(error);
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
        return cause.message;
    }
    return error.message;
}

export function parseErrorDetail(body: string): string | undefined {
    try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const message = parsed.message ?? (parsed.error as Record<string, unknown> | undefined)?.message;
        if (typeof message === "string") {
            return message;
        }
    } catch {
        // not JSON
    }
    return undefined;
}
