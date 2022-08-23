export function constructErrorMessage({
    messageOrError,
    error,
}: {
    messageOrError: unknown;
    error: unknown;
}): string | undefined {
    const parts: string[] = [];
    if (messageOrError != null) {
        parts.push(convertErrorToString(messageOrError));
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
