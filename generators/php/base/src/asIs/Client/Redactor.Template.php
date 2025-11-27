<?php

namespace <%= namespace%>;

/**
 * Utility class for redacting sensitive information from logs and error messages.
 * This helps prevent accidental exposure of credentials like bearer tokens,
 * client IDs, client secrets, and other sensitive data.
 */
final class Redactor
{
    /**
     * Headers that should be redacted when logging.
     * @var array<string>
     */
    private const SENSITIVE_HEADERS = [
        'authorization',
        'www-authenticate',
        'x-api-key',
        'api-key',
        'apikey',
        'x-api-token',
        'x-auth-token',
        'auth-token',
        'cookie',
        'set-cookie',
        'proxy-authorization',
        'proxy-authenticate',
        'x-csrf-token',
        'x-xsrf-token',
        'x-session-token',
        'x-access-token',
    ];

    /**
     * Query parameters that should be redacted when logging.
     * @var array<string>
     */
    private const SENSITIVE_QUERY_PARAMS = [
        'api_key',
        'api-key',
        'apikey',
        'token',
        'access_token',
        'access-token',
        'auth_token',
        'auth-token',
        'password',
        'passwd',
        'secret',
        'api_secret',
        'api-secret',
        'apisecret',
        'key',
        'session',
        'session_id',
        'session-id',
    ];

    /**
     * Body/JSON keys that should be redacted when logging.
     * @var array<string>
     */
    private const SENSITIVE_BODY_KEYS = [
        'access_token',
        'accessToken',
        'refresh_token',
        'refreshToken',
        'id_token',
        'idToken',
        'token',
        'client_secret',
        'clientSecret',
        'password',
        'api_key',
        'apiKey',
        'secret',
    ];

    private const REDACTED = '[REDACTED]';

    /**
     * Redacts sensitive values from an array of headers.
     *
     * @param array<string, string> $headers
     * @return array<string, string>
     */
    public static function redactHeaders(array $headers): array
    {
        $redacted = [];
        foreach ($headers as $key => $value) {
            if (in_array(strtolower($key), self::SENSITIVE_HEADERS, true)) {
                $redacted[$key] = self::REDACTED;
            } else {
                $redacted[$key] = $value;
            }
        }
        return $redacted;
    }

    /**
     * Redacts sensitive values from query parameters.
     *
     * @param array<int|string, mixed>|null $params
     * @return array<int|string, mixed>|null
     */
    public static function redactQueryParams(?array $params): ?array
    {
        if ($params === null) {
            return null;
        }
        $redacted = [];
        foreach ($params as $key => $value) {
            $keyStr = is_string($key) ? $key : (string) $key;
            if (in_array(strtolower($keyStr), self::SENSITIVE_QUERY_PARAMS, true)) {
                $redacted[$key] = self::REDACTED;
            } else {
                $redacted[$key] = $value;
            }
        }
        return $redacted;
    }

    /**
     * Redacts credentials from a URL (userinfo and sensitive query params).
     *
     * @param string $url
     * @return string
     */
    public static function redactUrl(string $url): string
    {
        $parsed = parse_url($url);
        if ($parsed === false) {
            return $url;
        }

        // Redact userinfo (user:pass@host)
        if (isset($parsed['user']) || isset($parsed['pass'])) {
            $parsed['user'] = self::REDACTED;
            unset($parsed['pass']);
        }

        // Redact sensitive query parameters
        if (isset($parsed['query'])) {
            parse_str($parsed['query'], $queryParams);
            $redactedParams = self::redactQueryParams($queryParams);
            $parsed['query'] = http_build_query($redactedParams ?? []);
        }

        return self::buildUrl($parsed);
    }

    /**
     * Redacts sensitive keys from a mixed body (array, object, or JSON string).
     *
     * @param mixed $body
     * @return mixed
     */
    public static function redactBody(mixed $body): mixed
    {
        if ($body === null) {
            return null;
        }

        // If it's a string, try to decode as JSON
        if (is_string($body)) {
            $decoded = json_decode($body, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $redacted = self::redactArray($decoded);
                return json_encode($redacted) ?: '';
            }
            return $body;
        }

        // If it's an array, redact recursively
        if (is_array($body)) {
            return self::redactArray($body);
        }

        // If it's an object, convert to array, redact, and return as object
        if (is_object($body)) {
            $array = (array) $body;
            return (object) self::redactArray($array);
        }

        return $body;
    }

    /**
     * Recursively redacts sensitive keys from an array.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private static function redactArray(array $data): array
    {
        $redacted = [];
        foreach ($data as $key => $value) {
            if (is_string($key) && in_array(strtolower($key), array_map('strtolower', self::SENSITIVE_BODY_KEYS), true)) {
                $redacted[$key] = self::REDACTED;
            } elseif (is_array($value)) {
                $redacted[$key] = self::redactArray($value);
            } elseif (is_object($value)) {
                $redacted[$key] = (object) self::redactArray((array) $value);
            } else {
                $redacted[$key] = $value;
            }
        }
        return $redacted;
    }

    /**
     * Builds a URL from parsed components.
     *
     * @param array<string, mixed> $parts
     * @return string
     */
    private static function buildUrl(array $parts): string
    {
        $url = '';
        if (isset($parts['scheme'])) {
            $url .= $parts['scheme'] . '://';
        }
        if (isset($parts['user'])) {
            $url .= $parts['user'];
            if (isset($parts['pass'])) {
                $url .= ':' . $parts['pass'];
            }
            $url .= '@';
        }
        if (isset($parts['host'])) {
            $url .= $parts['host'];
        }
        if (isset($parts['port'])) {
            $url .= ':' . $parts['port'];
        }
        if (isset($parts['path'])) {
            $url .= $parts['path'];
        }
        if (isset($parts['query']) && $parts['query'] !== '') {
            $url .= '?' . $parts['query'];
        }
        if (isset($parts['fragment'])) {
            $url .= '#' . $parts['fragment'];
        }
        return $url;
    }
}
