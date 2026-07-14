<?php

namespace Seed;

use Seed\Core\WebhookSignature;

/**
 * Verify an HMAC webhook signature.
 *
 * Extract the signature from the "x-webhook-signature" header and pass it as the signatureHeader parameter.
 * Extract the timestamp from the "x-webhook-timestamp" header and pass it as the timestampHeader parameter.
 */
class WebhooksHelper
{
    /**
     * @param (
     *    string
     *   |null
     * ) $requestBody
     * @param (
     *    string
     *   |null
     * ) $signatureHeader
     * @param (
     *    string
     *   |null
     * ) $signatureKey
     * @param (
     *    string
     *   |null
     * ) $timestampHeader
     * @return bool
     */
    public static function verifySignature(string|null $requestBody, string|null $signatureHeader, string|null $signatureKey, string|null $timestampHeader): bool
    {
        if ($requestBody === null || $requestBody === '' || $signatureHeader === null || $signatureHeader === '' || $signatureKey === null || $signatureKey === '') {
            throw new \InvalidArgumentException("Missing required parameters for webhook signature verification");
        }

        if ($timestampHeader === null || $timestampHeader === '') {
            throw new \InvalidArgumentException("Missing timestamp header 'x-webhook-timestamp' for webhook signature verification");
        }

        $timestampValue = filter_var($timestampHeader, FILTER_VALIDATE_INT);
        if ($timestampValue === false) {
            throw new \InvalidArgumentException("Invalid timestamp format: expected unix seconds");
        }
        $timestampMs = $timestampValue * 1000;

        if (abs(microtime(true) * 1000 - $timestampMs) > 300 * 1000) {
            return false;
        }

        $signaturePrefix = "sha256=";
        $signature = str_starts_with($signatureHeader, $signaturePrefix)
            ? substr($signatureHeader, strlen($signaturePrefix))
            : $signatureHeader;

        $payload = implode(".", [$timestampHeader, $requestBody]);

        $expected = WebhookSignature::computeHmacSignature(
            payload: $payload,
            secret: $signatureKey,
            algorithm: "sha256",
            encoding: "hex",
        );

        return WebhookSignature::timingSafeEqual($signature, $expected);
    }
}
