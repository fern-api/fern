import { anySignal, getTimeoutSignal } from "./signals";

const INITIAL_RETRY_DELAY = 1;
const MAX_RETRY_DELAY = 60;
const DEFAULT_MAX_RETRIES = 2;

export const makeRequest = async (
    fetchFn: (url: string, init: RequestInit) => Promise<Response>,
    url: string,
    method: string,
    headers: Record<string, string>,
    requestBody: BodyInit | undefined,
    timeoutMs?: number,
    abortSignal?: AbortSignal,
    withCredentials?: boolean
): Promise<Response> => {
    const signals: AbortSignal[] = [];

    // Add timeout signal
    let timeoutAbortId: NodeJS.Timeout | undefined = undefined;
    if (timeoutMs != null) {
        const { signal, abortId } = getTimeoutSignal(timeoutMs);
        timeoutAbortId = abortId;
        signals.push(signal);
    }

    // Add arbitrary signal
    if (abortSignal != null) {
        signals.push(abortSignal);
    }
    let newSignals = anySignal(signals);
    const response = await fetchFn(url, {
        method: method,
        headers,
        body: requestBody,
        signal: newSignals,
        credentials: withCredentials ? "include" : undefined
    });

    if (timeoutAbortId != null) {
        clearTimeout(timeoutAbortId);
    }

    return response;
};

export async function requestWithRetries(
    requestFn: () => Promise<Response>,
    maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<Response> {
    let response: Response;
    for (let i = 0; i < maxRetries; i++) {
        response = await requestFn();
        if ([408, 409, 429].includes(response.status) || response.status >= 500) {
            const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, i), MAX_RETRY_DELAY);
            await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
            break;
        }
    }
    return response!;
}
