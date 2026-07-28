<?php

namespace Seed;

use Seed\Core\WebhookSignature;

/**
 * Verify an HMAC webhook signature.
 *
 * Extract the signature from the "x-twilio-signature" header and pass it as the signatureHeader parameter.
 * The requestBody parameter accepts either a raw string or an array of POST body parameters.
 * When an array is provided, keys are sorted and each key's values are deduped and sorted, then concatenated as key-value pairs before signing.
 * This helper verifies both classic form-encoded and JSON requests: it branches at runtime on whether the body-hash query parameter is present on the notification URL.
 * For a JSON request the raw body is verified against that separately-transmitted hash and the signature is checked over the notification URL only.
 * Pass the exact raw body as requestBody and the verbatim notification URL as notificationUrl.
 * The signature is verified against several normalized forms of the notification URL, succeeding if any candidate matches.
 */
class SmsStatusWebhooksHelper
{
    /**
     * @param (
     *    string
     *   |array<string, (
     *    string
     *   |array<string>
     * )>
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
    public static function verifySignature(string|array|null $requestBody, string|null $signatureHeader, string|null $signatureKey, string|null $notificationUrl): bool
    {
        if ($requestBody === null || $requestBody === '' || $requestBody === [] || $signatureHeader === null || $signatureHeader === '' || $signatureKey === null || $signatureKey === '') {
            return false;
        }

        $signature = $signatureHeader;

        $transmittedBodyHash = WebhookSignature::getWebhookQueryParameter($notificationUrl, "bodySHA256");
        if ($transmittedBodyHash !== null) {
            $rawBody = is_string($requestBody) ? $requestBody : '';
            $expectedBodyHash = WebhookSignature::computeHash($rawBody, "sha256", "hex");
            if (!WebhookSignature::timingSafeEqual($expectedBodyHash, $transmittedBodyHash)) {
                return false;
            }
        }
        if (is_string($requestBody)) {
            $bodyString = $requestBody;
        } else {
            ksort($requestBody);
            $bodyString = '';
            foreach ($requestBody as $key => $value) {
                $values = is_array($value) ? $value : [$value];
                $values = array_values(array_unique($values));
                sort($values, SORT_STRING);
                foreach ($values as $singleValue) {
                    $bodyString .= $key . $singleValue;
                }
            }
        }
        $candidates = WebhookSignature::notificationUrlCandidates($notificationUrl, true, true);
        foreach ($candidates as $candidateUrl) {
            $payload = $transmittedBodyHash !== null ? $candidateUrl : implode("", [$candidateUrl, $bodyString]);
            $expected = WebhookSignature::computeHmacSignature(
                payload: $payload,
                secret: $signatureKey,
                algorithm: "sha1",
                encoding: "base64",
            );
            if (WebhookSignature::timingSafeEqual($signature, $expected)) {
                return true;
            }
        }

        return false;
    }
}
