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

    /**
     * Build the list of normalized notification-URL forms to verify a webhook signature
     * against. Some providers (for example, Twilio) are inconsistent about whether the URL
     * they signed carried a port and how its query string was encoded, so a signature is
     * accepted if it matches the computation over ANY of these candidates.
     *
     * Mirrors twilio's addPort / removePort / buildUrlWithStandardPort /
     * withLegacyQuerystring. Always includes at least the caller-supplied URL and never
     * throws: an unparseable URL yields [$url].
     *
     * @return list<string>
     */
    public static function notificationUrlCandidates(?string $url, bool $portVariants, bool $legacyQueryEncoding): array
    {
        if ($url === null) {
            return [];
        }
        $parsed = parse_url($url);
        if ($parsed === false || !isset($parsed['host'])) {
            return [$url];
        }

        $portForms = $portVariants ? [self::removePort($parsed), self::addPort($parsed)] : [$url];

        // Preserve insertion order while collapsing forms that coincide (for example, a URL
        // that already carries a standard port, or a query-less URL under legacy encoding).
        $candidates = [];
        foreach (array_merge([$url], $portForms) as $candidate) {
            $candidates[$candidate] = true;
        }
        if ($legacyQueryEncoding) {
            foreach ($portForms as $form) {
                $candidates[self::withLegacyQuerystring($form)] = true;
            }
        }

        return array_keys($candidates);
    }

    /**
     * @param array<string, int|string> $parsed the result of parse_url()
     */
    private static function addPort(array $parsed): string
    {
        if (isset($parsed['port'])) {
            return self::buildUrl($parsed);
        }

        return self::buildUrlWithStandardPort($parsed);
    }

    /**
     * @param array<string, int|string> $parsed the result of parse_url()
     */
    private static function removePort(array $parsed): string
    {
        unset($parsed['port']);

        return self::buildUrl($parsed);
    }

    /**
     * @param array<string, int|string> $parsed the result of parse_url()
     */
    private static function buildUrlWithStandardPort(array $parsed): string
    {
        $scheme = isset($parsed['scheme']) ? strtolower((string) $parsed['scheme']) : '';
        $parsed['port'] = $scheme === 'https' ? 443 : 80;

        return self::buildUrl($parsed);
    }

    private static function withLegacyQuerystring(string $url): string
    {
        $parsed = parse_url($url);
        if ($parsed === false || !isset($parsed['query']) || $parsed['query'] === '') {
            return $url;
        }

        // Re-encode the query with legacy form-encoding, reversing percent-encoding
        // differences introduced by URL parsing.
        parse_str((string) $parsed['query'], $params);
        $parsed['query'] = http_build_query($params);

        return self::buildUrl($parsed);
    }

    /**
     * Reassemble a URL from the associative array returned by parse_url(), preserving the
     * component order so the resulting string is byte-comparable to the URL the provider
     * signed.
     *
     * @param array<string, int|string> $parsed
     */
    private static function buildUrl(array $parsed): string
    {
        $url = '';
        if (isset($parsed['scheme'])) {
            $url .= $parsed['scheme'] . '://';
        }
        if (isset($parsed['user'])) {
            $url .= $parsed['user'];
            if (isset($parsed['pass'])) {
                $url .= ':' . $parsed['pass'];
            }
            $url .= '@';
        }
        if (isset($parsed['host'])) {
            $url .= $parsed['host'];
        }
        if (isset($parsed['port'])) {
            $url .= ':' . $parsed['port'];
        }
        if (isset($parsed['path'])) {
            $url .= $parsed['path'];
        }
        if (isset($parsed['query'])) {
            $url .= '?' . $parsed['query'];
        }
        if (isset($parsed['fragment'])) {
            $url .= '#' . $parsed['fragment'];
        }

        return $url;
    }

    /**
     * Constant-time comparison. hash_equals() requires the known/expected string as its
     * first argument and the user-supplied string second, so the arguments are
     * intentionally passed in the opposite order from this method's parameters — do not
     * "fix" the apparent swap.
     */
    public static function timingSafeEqual(string $provided, string $expected): bool
    {
        return hash_equals($expected, $provided);
    }
}
