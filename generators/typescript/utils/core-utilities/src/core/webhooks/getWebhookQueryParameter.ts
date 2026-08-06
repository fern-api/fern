/**
 * Read a single query parameter value from a URL without mutating or reordering it.
 * Used to extract a transmitted body hash (e.g. Twilio's bodySHA256) from the
 * notification URL. Returns undefined when the URL is unparseable or the parameter
 * is absent.
 */
export function getWebhookQueryParameter(url: string, name: string): string | undefined {
    try {
        return new URL(url).searchParams.get(name) ?? undefined;
    } catch {
        return undefined;
    }
}
