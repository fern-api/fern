const INITIAL_RETRY_DELAY = 1;
const MAX_RETRY_DELAY = 60;
const DEFAULT_MAX_RETRIES = 2;

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
