export function constructErrorMessage({
    message,
    error,
}: {
    message: string | undefined;
    error: unknown;
}): string | undefined {
    const parts: string[] = [];
    if (message != null) {
        parts.push(message);
    }
    if (error != null) {
        parts.push(convertErrorToString(error));
    }
    if (parts.length > 0) {
        return parts.join(" ");
    } else {
        return undefined;
    }
}

function convertErrorToString(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    return JSON.stringify(error);
}
