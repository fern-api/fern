<?php

namespace Seed\Core;

class WebhookSignature
{
    /**
     * @param 'sha1'|'sha256'|'sha384'|'sha512' $algorithm
     * @param 'base64'|'hex' $encoding
     */
    public static function computeHmacSignature(
        string $payload,
        string $secret,
        string $algorithm,
        string $encoding,
    ): string {
        if ($encoding === 'base64') {
            return base64_encode(hash_hmac($algorithm, $payload, $secret, true));
        }

        return hash_hmac($algorithm, $payload, $secret);
    }

    /**
     * Compute an unkeyed digest of the raw request body. Unlike computeHmacSignature this
     * is not keyed; it is used by providers that transmit a hash of the raw body separately
     * (for example, Twilio's bodySHA256 query parameter) rather than signing the body directly.
     *
     * @param 'sha1'|'sha256'|'sha384'|'sha512' $algorithm
     * @param 'base64'|'hex' $encoding
     */
    public static function computeHash(
        string $payload,
        string $algorithm,
        string $encoding,
    ): string {
        if ($encoding === 'base64') {
            return base64_encode(hash($algorithm, $payload, true));
        }

        return hash($algorithm, $payload);
    }

    /**
     * Read a single query parameter value from a URL without mutating or reordering it.
     * Used to extract a transmitted body hash (for example, Twilio's bodySHA256) from the
     * notification URL. Returns null when the URL is unparseable or the parameter is absent.
     */
    public static function getWebhookQueryParameter(?string $url, string $name): ?string
    {
        if ($url === null) {
            return null;
        }
        $query = parse_url($url, PHP_URL_QUERY);
        if (!is_string($query)) {
            return null;
        }
        parse_str($query, $params);
        $value = $params[$name] ?? null;

        return is_string($value) ? $value : null;
    }

    public static function timingSafeEqual(string $provided, string $expected): bool
    {
        return hash_equals($expected, $provided);
    }
}
