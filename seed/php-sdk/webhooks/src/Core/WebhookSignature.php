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

    public static function timingSafeEqual(string $provided, string $expected): bool
    {
        return hash_equals($expected, $provided);
    }
}
