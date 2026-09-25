/**
 * Returns the php expression that sends a boolean header as 'true' or 'false'. Header values reach
 * the transport through php's string cast, which turns true into "1" and false into "".
 *
 * @param reference the php expression holding the header value
 * @param clientDefault the value to send when `reference` is null
 * @param mayBeString whether `reference` can already hold a wire string (a root-client default or
 *   environment variable), which is sent unchanged
 */
export function booleanHeaderValue({
    reference,
    clientDefault,
    mayBeString = false
}: {
    reference: string;
    clientDefault?: boolean;
    mayBeString?: boolean;
}): string {
    const value = clientDefault != null ? `(${reference} ?? ${clientDefault})` : reference;
    const spelled = `${value} ? 'true' : 'false'`;
    return mayBeString ? `is_string(${reference}) ? ${reference} : (${spelled})` : spelled;
}
