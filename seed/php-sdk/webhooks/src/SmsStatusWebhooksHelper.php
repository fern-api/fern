<?php

namespace Seed;

use Seed\Core\WebhookSignature;

/**
 * Verify an HMAC webhook signature.
 *
 * Extract the signature from the "x-twilio-signature" header and pass it as the signatureHeader parameter.
 * The raw request body is verified against a hash transmitted separately (not signed directly): pass the exact raw body as requestBody and the verbatim notification URL as notificationUrl.
 */
class SmsStatusWebhooksHelper
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
     * ) $notificationUrl
     * @return bool
     */
    public static function verifySignature(string|null $requestBody, string|null $signatureHeader, string|null $signatureKey, string|null $notificationUrl): bool
    {
        if ($requestBody === null || $requestBody === '' || $signatureHeader === null || $signatureHeader === '' || $signatureKey === null || $signatureKey === '') {
            throw new \InvalidArgumentException("Missing required parameters for webhook signature verification");
        }

        $signature = $signatureHeader;

        $payload = implode("", [$notificationUrl]);

        $expectedBodyHash = WebhookSignature::computeHash($requestBody, "sha256", "hex");
        $transmittedBodyHash = WebhookSignature::getWebhookQueryParameter($notificationUrl, "bodySHA256");
        if ($transmittedBodyHash === null || !WebhookSignature::timingSafeEqual($transmittedBodyHash, $expectedBodyHash)) {
            return false;
        }

        $expected = WebhookSignature::computeHmacSignature(
            payload: $payload,
            secret: $signatureKey,
            algorithm: "sha1",
            encoding: "base64",
        );

        return WebhookSignature::timingSafeEqual($signature, $expected);
    }
}
